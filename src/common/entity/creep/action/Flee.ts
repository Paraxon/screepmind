import Flatten from "@flatten-js/core";
import { Action } from "common/decisions/actions/Action";
import { TEAM_ENEMY } from "common/entity/team/Team";
import { Predicate, Prototype, ScreepsReturnCode } from "common/Library";
import { dir } from "console";
import { ERR_NO_PATH, MOVE, OK, RANGED_ATTACK } from "game/constants";
import { Goal, searchPath, SearchPathOptions } from "game/path-finder";
import { Creep, GameObject } from "game/prototypes";
import { findPath, getDirection } from "game/utils";
import { INTENT_RANGE } from "../CreepIntent";
import { CreepAction } from "./CreepAction";


export class FleeClosest<threat_t extends GameObject> extends CreepAction {
	private readonly predicate: (actor: GameObject, object: threat_t) => boolean;
	private readonly prototype: Prototype<threat_t>;
	private readonly options?: SearchPathOptions;
	private readonly range: number;
	public constructor(prototype: Prototype<threat_t>, range: number, predicate: (actor: GameObject, threat: threat_t) => boolean = (actor, threat) => true, options?: SearchPathOptions) {
		super(MOVE);
		this.prototype = prototype;
		this.range = range;
		this.options = options;
		this.predicate = predicate;
	}
	public decide(actor: Creep): Action<Creep, number> {
		return new FleeClosest(this.prototype, this.range, this.predicate, this.options);
	}
	public execute(actor: Creep): ScreepsReturnCode | undefined {
		const threats = TEAM_ENEMY.GetAll(this.prototype).filter(this.predicate.bind(null, actor));
		const closest = actor.findClosestByRange(threats);
		return actor.moveTo(closest, { flee: true });
	}
	public isComplete(actor: Creep): boolean {
		const threat = actor.findClosestByRange(TEAM_ENEMY.GetAll(this.prototype).filter(this.predicate.bind(null, actor)));
		return actor.getRangeTo(threat) < INTENT_RANGE[RANGED_ATTACK]!;
	}
}