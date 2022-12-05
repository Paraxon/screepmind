import { Action } from "common/decisions/actions/Action";
import { TEAM_ENEMY } from "common/entity/team/Team";
import { Prototype, ScreepsReturnCode } from "common/Library";
import { Logger } from "common/patterns/Logger";
import { ERR_INVALID_TARGET, ERR_NOT_FOUND, ERR_NO_PATH, MOVE } from "game/constants";
import { Goal, searchPath, SearchPathOptions } from "game/path-finder";
import { Creep, GameObject } from "game/prototypes";
import { getDirection } from "game/utils";
import { Visual } from "game/visual";
import { CreepAction } from "./CreepAction";


export class FleeClosest<threat_t extends GameObject> extends CreepAction {
	private readonly predicate: (actor: GameObject, object: threat_t) => boolean;
	private readonly prototype: Prototype<threat_t>;
	private readonly options?: SearchPathOptions;
	private readonly radius: number;
	public constructor(prototype: Prototype<threat_t>, radius: number, predicate: (actor: GameObject, threat: threat_t) => boolean = (actor, threat) => true, options?: SearchPathOptions) {
		super(MOVE);
		this.prototype = prototype;
		this.radius = radius;
		this.options = options;
		this.predicate = predicate;
	}
	public decide(actor: Creep): Action<Creep, number> {
		return new FleeClosest(this.prototype, this.radius, this.predicate, this.options);
	}
	public execute(actor: Creep): ScreepsReturnCode | undefined {
		return this.fleeMulti(actor);
	}
	private fleeSingle(actor: Creep) {
		const threats = TEAM_ENEMY.GetAll(this.prototype).filter(this.predicate.bind(null, actor));
		if (threats.length === 0) return ERR_NOT_FOUND;
		const closest = actor.findClosestByRange(threats);
		Logger.log('action', `actor ${actor.id} is fleeing from creep ${closest.id} of ${threats.length} threats`);
		return actor.moveTo(closest, { ...this.options, flee: true });
	}
	private fleeMulti(actor: Creep) {
		const threats = TEAM_ENEMY.GetAll(this.prototype)
			.filter(threat => actor.getRangeTo(threat) <= this.radius)
			.filter(this.predicate.bind(null, actor));
		if (threats.length === 0) return ERR_NOT_FOUND;
		const goals: Goal[] = threats.map(threat => ({ pos: { x: threat.x, y: threat.y }, range: 10 }));
		const path = searchPath(actor, goals, { ...this.options, flee: true });
		if (path.incomplete) return ERR_NO_PATH;
		new Visual(1, false).poly(path.path, { stroke: '#fff00' });
		const destination = path.path[0];
		Logger.log('debug', `creep ${actor.id} fleeing from ${threats.length} threats ${path.path.length} steps away to ${destination}`);
		const dx = destination.x - actor.x;
		const dy = destination.y - actor.y;
		return actor.move(getDirection(dx, dy));
	}
	public isComplete(actor: Creep): boolean {
		const threat = actor.findClosestByRange(TEAM_ENEMY.GetAll(this.prototype)
			.filter(this.predicate.bind(null, actor)));
		return actor.getRangeTo(threat) < this.radius;
	}
}