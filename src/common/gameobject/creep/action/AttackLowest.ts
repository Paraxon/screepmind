import { Action } from "common/decisions/actions/Action";
import { ScreepsReturnCode, Target } from "common/Library";
import { Targeter } from "common/gameobject/Targeter";
import { ATTACK, ERR_NOT_FOUND } from "game/constants";
import { Creep } from "game/prototypes";
import { INTENT_RANGE } from "../CreepIntent";
import { CreepAction } from "./CreepAction";

export class AttackLowest<target_t extends Target> extends CreepAction {
	private readonly targeter: Targeter<target_t>;
	public constructor(targeter: Targeter<target_t>) {
		super(ATTACK);
		this.targeter = targeter;
	}
	public decide(actor: Creep): Action<Creep, number> {
		return new AttackLowest(this.targeter);
	}
	public execute(actor: Creep): ScreepsReturnCode | undefined {
		const targets = this.targeter.inRange(actor, INTENT_RANGE[ATTACK]!);
		if (!targets) return ERR_NOT_FOUND;
		const lowest = targets.reduce((lowest, current) => lowest.hits! < current.hits! ? lowest : current);
		return actor.attack(lowest);
	}
	public isComplete(actor: Creep): boolean {
		return !this.targeter.inRange(actor, INTENT_RANGE[ATTACK]!).length;
	}
}