import { Action } from "common/decisions/DecisionMaker";
import { ACTION_PIPELINES, Intent } from "common/gameobject/creep/CreepIntent";
import { Speech } from "common/gameobject/Speech";
import { Creep } from "game/prototypes";
import { is_error, ScreepsResult } from "../../Result";
import { ERROR_EMOJI, INTENT_EMOJI } from "common/gameobject/Emoji";
import { OK } from "game/constants";
import { Logger } from "common/patterns/Logger";
import { Verbosity } from "common/patterns/Verbosity";

export abstract class CreepAction implements Action<Creep, ScreepsResult> {
	public constructor(public readonly intent: Intent) {}
	public canDoBoth(other: Action<Creep, ScreepsResult>): boolean {
		return other instanceof CreepAction ? !CreepAction.compareIntents(this.intent, other.intent) : true;
	}
	public static compareIntents(a: Intent, b: Intent): number | undefined {
		const conflict = ACTION_PIPELINES.find(pipeline => pipeline.includes(a) && pipeline.includes(b));
		return conflict && conflict.indexOf(a) - conflict.indexOf(b);
	}
	protected emote(actor: Creep, result: ScreepsResult): void {
		if (is_error(result))
			Logger.log("action", `creep ${actor.id} returned error ${result} after acting`, Verbosity.Error);
		if (ERROR_EMOJI[result] == undefined) console.log(`no error emoji for result ${result}`);
		Speech.say(actor, result == OK ? INTENT_EMOJI[this.intent] : ERROR_EMOJI[result]);
	}
	public decide(_actor: Creep): Action<Creep, ScreepsResult> {
		return this;
	}
	public abstract execute(actor: Creep): ScreepsResult;
	public abstract isComplete(actor: Creep): boolean;
}
