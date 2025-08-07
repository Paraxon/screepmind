import { Action } from "common/decisions/actions/Action";
import { ScreepsResult } from "common/gameobject/Result";
import * as Consts from "game/constants";
import * as Proto from "game/prototypes";
import * as Utils from "game/utils";
import * as Intent from "../CreepIntent";
import { CreepAction } from "./CreepAction";

export class BoundAction<target_t> extends CreepAction {
	private action: (target: target_t) => ScreepsResult;
	private selector: (actor: Proto.Creep) => target_t;
	public constructor(action: (target: target_t) => ScreepsResult, selector: (actor: Proto.Creep) => target_t) {
		super(Intent.METHOD.get(action)!);
		this.action = action;
		this.selector = selector;
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

// transfer, withdraw, drop, and moveTo are not implemented as BoundActions
