import { Action } from "common/decisions/actions/Action";
import { TEAM_ENEMY } from "common/entity/team/Team";
import { ScreepsReturnCode } from "common/gameobject/ReturnCode";
import { BinaryPredicate, Distance, FLEE_SEARCH_RADIUS, Prototype } from "common/library";
import { ERR_NOT_FOUND, ERR_NO_PATH, MOVE } from "game/constants";
import { Goal, searchPath, SearchPathOptions, SearchPathResult } from "game/path-finder";
import { Creep, GameObject } from "game/prototypes";
import { FindPathOptions, getDirection } from "game/utils";
import { Visual } from "game/visual";
import { CreepAction } from "./CreepAction";

export class FleeThreats<threat_t extends GameObject> extends CreepAction {
	private readonly predicate: BinaryPredicate<GameObject, threat_t>;
	private readonly prototype: Prototype<threat_t>;
	private readonly _options?: SearchPathOptions;
	private readonly radius: Distance;
	public constructor(prototype: Prototype<threat_t>, radius: Distance, predicate: BinaryPredicate<GameObject, threat_t> = () => true, options?: SearchPathOptions) {
		super(MOVE);
		this.prototype = prototype;
		this.radius = radius;
		this.predicate = predicate;
		this._options = { ...options };
	}
	public decide(actor: Creep): Action<Creep, ScreepsReturnCode> {
		return new FleeThreats(this.prototype, this.radius, this.predicate, this._options);
	}
	public execute(actor: Creep): ScreepsReturnCode | undefined {
		this.emote(actor);
		return this.fleeMulti(actor, this.targets(actor));
	}
	private fleeSingle(actor: Creep, threat: threat_t) {
		return actor.moveTo(threat, this.options);
	}
	private fleeMulti(actor: Creep, threats: threat_t[]) {
		if (threats.length === 0) return ERR_NOT_FOUND;
		const goals: Goal[] = threats.map(threat =>
			({ pos: { x: threat.x, y: threat.y }, range: FLEE_SEARCH_RADIUS }));
		const path = searchPath(actor, goals, this.options);
		new Visual().poly(path.path, { stroke: '#ffff00' });
		return this.followPath(actor, path);
	}
	public isComplete(actor: Creep): boolean {
		const threats = this.targets(actor);
		if (!threats.length) return true;
		const closest = actor.findClosestByRange(threats);
		return actor.getRangeTo(closest) > this.radius;
	}
	private get options(): FindPathOptions | undefined {
		return { ...this._options, flee: true };
	}
	private followPath(actor: Creep, path: SearchPathResult) {
		if (path.incomplete || !path.path.length)
			return ERR_NO_PATH;
		const destination = path.path[0];
		const dx = destination.x - actor.x;
		const dy = destination.y - actor.y;
		return actor.move(getDirection(dx, dy));
	}
	private targets(actor: Creep) {
		return TEAM_ENEMY.GetAll(this.prototype).filter(this.predicate.bind(null, actor));
	}
}