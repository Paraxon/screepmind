import { Action } from "common/decisions/actions/Action";
import { ScreepsReturnCode } from "common/gameobject/ReturnCode";
import { Creep } from "game/prototypes";
import { CreepAction } from "./CreepAction";
import { Targeter } from "common/gameobject/Targeter";
import { INTENT_RANGE, RANGED_HEAL } from "../CreepIntent";
import { ERR_NOT_FOUND } from "game/constants";

export class RangedHeal extends CreepAction {
	private readonly targeter: Targeter<Creep>;
	public constructor(targeter: Targeter<Creep>) {
		super(RANGED_HEAL);
		this.targeter = targeter;
	}
	public decide(actor: Creep): Action<Creep, ScreepsReturnCode> {
		return new RangedHeal(this.targeter);
	}
	public execute(actor: Creep): ScreepsReturnCode | undefined {
		const targets = this.targeter.inRange(actor, INTENT_RANGE[RANGED_HEAL]!);
		if (!targets.length) return ERR_NOT_FOUND;
		const lowest = targets.reduce((lowest, current) => lowest.hits / lowest.hitsMax < current.hits / current.hitsMax ? lowest : current);
		return actor.rangedHeal(lowest);
	}
	public isComplete(actor: Creep): boolean {
		throw new Error("Method not implemented.");
	}

}