import { Action } from "common/decisions/actions/Action";
import { ScreepsResult } from "common/gameobject/Result";
import { Creep } from "game/prototypes";
import { CreepAction } from "./CreepAction";
import { Targeter } from "common/gameobject/Targeter";
import { RANGE, RANGED_HEAL } from "../CreepIntent";
import { ERR_NOT_FOUND } from "game/constants";

export class RangedHeal extends CreepAction {
	private readonly targeter: Targeter<Creep>;
	public constructor(targeter: Targeter<Creep>) {
		super(RANGED_HEAL);
		this.targeter = targeter;
	}
	public decide(actor: Creep): Action<Creep, ScreepsResult> {
		return new RangedHeal(this.targeter);
	}
	public execute(actor: Creep): ScreepsResult | undefined {
		const targets = this.targeter.inRange(actor, RANGE[RANGED_HEAL]!);
		if (!targets.length) return ERR_NOT_FOUND;
		const lowest = targets.reduce((lowest, current) =>
			lowest.hits / lowest.hitsMax < current.hits / current.hitsMax ? lowest : current
		);
		return actor.rangedHeal(lowest);
	}
	public isComplete(actor: Creep): boolean {
		throw new Error("Method not implemented.");
	}
}
