import { Action } from "common/decisions/actions/Action";
import { ScreepsReturnCode } from "common/Library";
import { BUILD, DROP, HARVEST, Intent, RANGED_HEAL, RANGED_MASS_ATTACK, TRANSFER, WITHDRAW } from "common/entity/creep/CreepIntent";
import { ATTACK, HEAL, MOVE, RANGED_ATTACK, WORK } from "game/constants";
import { Creep } from "game/prototypes";

export abstract class CreepAction implements Action<Creep, ScreepsReturnCode> {
	private readonly intent: Intent;
	private static ACTION_PIPELINES: Intent[][] = [
		[HARVEST, ATTACK, BUILD, RANGED_HEAL, HEAL],
		[RANGED_ATTACK, RANGED_MASS_ATTACK, BUILD, RANGED_HEAL],
		[BUILD, WITHDRAW, TRANSFER, DROP]
	];
	public constructor(intent: Intent) {
		this.intent = intent;
	}
	canDoBoth(other: Action<Creep, ScreepsReturnCode>): boolean {
		if (other instanceof CreepAction)
			return CreepAction.compareIntents(this.intent, other.intent) === undefined;
		return true;
	}
	public static compareIntents(a: Intent, b: Intent): number | undefined {
		const conflict = CreepAction.ACTION_PIPELINES.find(
			pipeline => pipeline.includes(a) && pipeline.includes(b));
		return conflict && conflict.indexOf(a) - conflict.indexOf(b);
	}
	abstract decide(actor: Creep): Action<Creep, number>;
	abstract execute(actor: Creep): number | undefined;
	abstract isComplete(actor: Creep): boolean;
}