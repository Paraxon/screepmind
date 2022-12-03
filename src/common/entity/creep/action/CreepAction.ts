import { Action } from "common/decisions/actions/Action";
import { ScreepsReturnCode } from "common/Library";
import { ATTACK, HEAL, MOVE, RANGED_ATTACK, WORK } from "game/constants";
import { Creep } from "game/prototypes";

export const DROP = 'drop';
export const BUILD = 'build';
export const HARVEST = 'harvest';
export const PICKUP = 'pickup';
export const PULL = 'pull';
export const RANGED_HEAL = 'ranged_heal';
export const RANGED_MASS_ATTACK = 'ranged_mass_attack';
export const WITHDRAW = 'withdraw';
export const TRANSFER = 'transfer';

export type Intent =
	typeof ATTACK |
	typeof BUILD |
	typeof DROP |
	typeof HARVEST |
	typeof HEAL |
	typeof MOVE |
	typeof PICKUP |
	typeof PULL |
	typeof RANGED_ATTACK |
	typeof RANGED_HEAL |
	typeof RANGED_MASS_ATTACK |
	typeof TRANSFER |
	typeof WITHDRAW;

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
