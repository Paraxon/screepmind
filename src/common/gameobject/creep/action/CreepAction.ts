import { Action } from "common/decisions/actions/Action";
import { ACTION_PIPELINES, Intent, INTENT_EMOJI } from "common/gameobject/creep/CreepIntent";
import { Speech } from "common/gameobject/Speech";
import { Creep } from "game/prototypes";
import { ScreepsReturnCode } from "../../ReturnCode";

export abstract class CreepAction implements Action<Creep, ScreepsReturnCode> {
	public readonly intent: Intent;
	public constructor(intent: Intent) {
		this.intent = intent;
	}
	public canDoBoth(other: Action<Creep, ScreepsReturnCode>): boolean {
		return other instanceof CreepAction ?
			!CreepAction.compareIntents(this.intent, other.intent) :
			true;
	}
	public static compareIntents(a: Intent, b: Intent): number | undefined {
		const conflict = ACTION_PIPELINES.find(
			pipeline => pipeline.includes(a) && pipeline.includes(b));
		return conflict && conflict.indexOf(a) - conflict.indexOf(b);
	}
	protected emote(actor: Creep): void {
		Speech.say(actor, INTENT_EMOJI[this.intent]);
	}
	public abstract decide(actor: Creep): Action<Creep, ScreepsReturnCode>;
	public abstract execute(actor: Creep): ScreepsReturnCode | undefined;
	public abstract isComplete(actor: Creep): boolean;
}