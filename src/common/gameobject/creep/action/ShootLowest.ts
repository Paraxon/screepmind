import { Action } from "common/decisions/actions/Action";
import { TEAM_ENEMY } from "common/entity/team/Team";
import { Predicate, Prototype, Target } from "common/Library";
import { Targeter } from "common/gameobject/Targeter";
import { ERR_NOT_FOUND, RANGED_ATTACK } from "game/constants";
import { Creep, GameObject } from "game/prototypes";
import { Visual } from "game/visual";
import { INTENT_RANGE } from "../CreepIntent";
import { CreepAction } from "./CreepAction";
import { ScreepsReturnCode } from "common/gameobject/ReturnCode";

export class ShootLowest<target_t extends Target> extends CreepAction {
	private readonly targeter: Targeter<target_t>;
	public constructor(targeter: Targeter<target_t>) {
		super(RANGED_ATTACK);
		this.targeter = targeter;
	}
	public decide(actor: Creep): Action<Creep, ScreepsReturnCode> {
		return new ShootLowest(this.targeter);
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
			this.targeter.all(),
			INTENT_RANGE[RANGED_ATTACK]!)
	}
}