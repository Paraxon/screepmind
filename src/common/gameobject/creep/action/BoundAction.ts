import { Action } from "common/decisions/DecisionMaker";
import { ScreepsResult } from "common/gameobject/Result";
import * as Proto from "game/prototypes";
import * as Intent from "../CreepIntent";
import { CreepAction } from "./CreepAction";

// transfer, withdraw, drop, and moveTo are not implemented as BoundActions
export class BoundAction<target_t> extends CreepAction {
	public constructor(
		private action: (target: target_t) => ScreepsResult,
		private selector: (actor: Proto.Creep) => target_t
	) {
		super(Intent.METHOD.get(action)!);
	}
	public decide(actor: Proto.Creep): Action<Proto.Creep, ScreepsResult> {
		return this;
	}
	public execute(actor: Proto.Creep): ScreepsResult | undefined {
		this.emote(actor);
		return this.action.call(actor, this.selector(actor));
	}
	public isComplete(actor: Proto.Creep): boolean {
		return !this.selector(actor);
	}
}
