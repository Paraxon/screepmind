import { ERR_NOT_FOUND, HEAL } from "game/constants";
import { CreepAction } from "./CreepAction";
import { Action } from "common/decisions/actions/Action";
import { ScreepsResult } from "common/gameobject/Result";
import { Creep } from "game/prototypes";
import { Targeter } from "common/gameobject/Targeter";
import { RANGE } from "../CreepIntent";

export class TouchHeal extends CreepAction {
	private readonly targeter: Targeter<Creep>;
	public decide(actor: Creep): Action<Creep, ScreepsResult> {
		return new TouchHeal(this.targeter);
	}
	public execute(actor: Creep): ScreepsResult | undefined {
		const targets = this.targeter.inRange(actor, RANGE[HEAL]!);
		if (!targets.length) return ERR_NOT_FOUND;
		const lowest = targets.reduce((lowest, current) =>
			lowest.hits / lowest.hitsMax < current.hits / current.hitsMax ? lowest : current
		);
		return actor.heal(lowest);
	}
	public isComplete(actor: Creep): boolean {
		return !this.targeter.inRange(actor, RANGE[HEAL]!).length;
	}
	constructor(targeter: Targeter<Creep>) {
		super(HEAL);
		this.targeter = targeter;
	}
}
