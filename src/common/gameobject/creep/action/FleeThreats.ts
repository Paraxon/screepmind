import { TEAM_ENEMY } from "common/entity/team/Team";
import { ScreepsResult } from "common/gameobject/Result";
import { Distance, FLEE_SEARCH_RADIUS, Prototype } from "common/library";
import { ERR_NOT_FOUND, ERR_NO_PATH, MOVE } from "game/constants";
import { Goal, searchPath, SearchPathOptions, SearchPathResult } from "game/path-finder";
import { Creep, GameObject } from "game/prototypes";
import { FindPathOptions, getDirection, getObjectsByPrototype } from "game/utils";
import { Visual } from "game/visual";
import { CreepAction } from "./CreepAction";
import * as Func from "../../../Functional";
import { Intent } from "../CreepIntent";

export class FleeThreats<threat_t extends GameObject> extends CreepAction {
	public constructor(
		private readonly prototype: Prototype<threat_t>,
		private readonly radius: Distance,
		private readonly predicate: Func.VariadicPredicate<[GameObject, threat_t]> = () => true,
		private readonly _options?: SearchPathOptions
	) {
		super(Intent.MOVE);
	}
	public execute(actor: Creep): ScreepsResult | undefined {
		this.emote(actor);
		const threats = this.targets(actor);
		if (threats.length === 0) return ERR_NOT_FOUND;
		const goals: Goal[] = threats.map(threat => ({ pos: { x: threat.x, y: threat.y }, range: FLEE_SEARCH_RADIUS }));
		const path = searchPath(actor, goals, this.options);
		new Visual().poly(path.path, { stroke: "#ffff00" });
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
		if (path.incomplete || !path.path.length) return ERR_NO_PATH;
		const destination = path.path[0];
		const dx = destination.x - actor.x;
		const dy = destination.y - actor.y;
		return actor.move(getDirection(dx, dy));
	}
	private targets(actor: Creep) {
		return getObjectsByPrototype(Creep).filter(target => !target.my);
	}
}
