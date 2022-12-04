import { Action } from "common/decisions/actions/Action";
import { ACTION_PIPELINES, Intent } from "common/entity/creep/CreepIntent";
import { ScreepsReturnCode } from "common/Library";
import { Creep } from "game/prototypes";

export abstract class CreepAction implements Action<Creep, ScreepsReturnCode> {
	private readonly intent: Intent;

	public constructor(intent: Intent) {
		this.intent = intent;
	}
	public canDoBoth(other: Action<Creep, ScreepsReturnCode>): boolean {
		if (other instanceof CreepAction)
			return CreepAction.compareIntents(this.intent, other.intent) === undefined;
		return true;
	}
	public static compareIntents(a: Intent, b: Intent): number | undefined {
		const conflict = ACTION_PIPELINES.find(
			pipeline => pipeline.includes(a) && pipeline.includes(b));
		return conflict && conflict.indexOf(a) - conflict.indexOf(b);
	}
	public abstract decide(actor: Creep): Action<Creep, number>;
	public abstract execute(actor: Creep): ScreepsReturnCode | undefined;
	public abstract isComplete(actor: Creep): boolean;
}