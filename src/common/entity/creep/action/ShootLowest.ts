import { Action } from "common/decisions/actions/Action";
import { TEAM_ENEMY } from "common/entity/team/Team";
import { Predicate, Prototype, ScreepsReturnCode, Target } from "common/Library";
import { ERR_NOT_FOUND, RANGED_ATTACK } from "game/constants";
import { Creep } from "game/prototypes";
import { INTENT_RANGE } from "../CreepIntent";
import { CreepAction } from "./CreepAction";

export class ShootLowest<target_t extends Target> extends CreepAction {
	private readonly prototype: Prototype<target_t>;
	private readonly predicate: Predicate<target_t>;
	public constructor(prototype: Prototype<target_t>, predicate: Predicate<target_t>) {
		super(RANGED_ATTACK);
		this.prototype = prototype;
		this.predicate = predicate;
	}
	public decide(actor: Creep): Action<Creep, number> {
		throw new Error("Method not implemented.");
	}
	public execute(actor: Creep): ScreepsReturnCode | undefined {
		const targets = this.getTargets(actor);
		if (!targets.length) return ERR_NOT_FOUND;
		const lowest = targets.reduce((lowest, current) => lowest.hits! < current.hits! ? lowest : current);
		return actor.rangedAttack(lowest);
	}
	public isComplete(actor: Creep): boolean {
		return !this.getTargets(actor).length;
	}
	private getTargets(actor: Creep): target_t[] {
		return actor.findInRange(
			TEAM_ENEMY.GetAll(this.prototype).filter(this.predicate),
			INTENT_RANGE[RANGED_ATTACK]!)
	}
}