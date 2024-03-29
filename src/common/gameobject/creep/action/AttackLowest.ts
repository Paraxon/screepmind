import { Action } from "common/decisions/actions/Action";
import { Targeter } from "common/gameobject/Targeter";
import { Target } from "common/Library";
import { ATTACK, ERR_INVALID_TARGET } from "game/constants";
import { Creep } from "game/prototypes";
import { ScreepsReturnCode } from "../../ReturnCode";
import { INTENT_RANGE } from "../CreepIntent";
import { CreepAction } from "./CreepAction";

export class AttackLowest<target_t extends Target> extends CreepAction {
	private readonly targeter: Targeter<target_t>;
	public constructor(targeter: Targeter<target_t>) {
		super(ATTACK);
		this.targeter = targeter;
	}
	public decide(actor: Creep): Action<Creep, ScreepsReturnCode> {
		return new AttackLowest(this.targeter);
	}
	public execute(actor: Creep): ScreepsReturnCode | undefined {
		this.emote(actor);
		const targets = this.targeter.inRange(actor, INTENT_RANGE[ATTACK]!);
		if (!targets) return ERR_INVALID_TARGET;
		const lowest = targets.reduce((lowest, current) => lowest.hits! < current.hits! ? lowest : current);
		return actor.attack(lowest);
	}
	public isComplete(actor: Creep): boolean {
		return !this.targeter.inRange(actor, INTENT_RANGE[ATTACK]!).length;
	}
}