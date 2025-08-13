import * as Proto from "game/prototypes";
import * as Result from "../../Result";
import * as Intent from "../CreepIntent";
import * as Consts from "game/constants";
import { CreepAction } from "./CreepAction";

export class BoundAction<target_t extends Proto.GameObject> extends CreepAction {
	public constructor(
		protected action: (target: target_t) => Result.ScreepsResult,
		protected targeter: (actor: Proto.Creep) => target_t | undefined,
		protected complete?: (actor: Proto.Creep, target: target_t) => boolean
	) {
		super(Intent.METHOD.get(action)!);
	}
	public execute(actor: Proto.Creep): Result.ScreepsResult {
		this.emote(actor);
		const target = this.targeter(actor);
		return target ? this.action.call(actor, target) : Consts.ERR_INVALID_TARGET;
	}
	public isComplete(actor: Proto.Creep): boolean {
		const target = this.targeter(actor);
		const range = Intent.RANGE[this.intent];
		return !target || (range && actor.getRangeTo(target) > range) || !!this.complete?.(actor, target);
	}
}
