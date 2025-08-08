import { Action } from "common/decisions/DecisionMaker";
import * as Proto from "game/prototypes";
import * as Intent from "../CreepIntent";
import { CreepAction } from "./CreepAction";
import * as Result from "../../Result";
import * as Consts from "game/constants";
import { ResourceType } from "game/prototypes";

// transfer, withdraw, and drop are not implemented as BoundActions
export class BoundAction<target_t> extends CreepAction {
	public constructor(
		protected action: (target: target_t) => Result.CreepResult,
		protected selector: (actor: Proto.Creep) => target_t
	) {
		super(Intent.METHOD.get(action) ?? (action.name as Intent.Intent));
	}
	public decide(actor: Proto.Creep): Action<Proto.Creep, Result.CreepResult> {
		return this;
	}
	public execute(actor: Proto.Creep): Result.CreepResult | undefined {
		this.emote(actor);
		return this.action.call(actor, this.selector(actor));
	}
	public isComplete(actor: Proto.Creep): boolean {
		return !this.selector(actor);
	}
}

export function bindResourceAction<target_t>(
	action: (target: target_t, resource: Proto.ResourceType, amount?: number | undefined) => Result.CreepResult,
	type: Proto.ResourceType = Consts.RESOURCE_ENERGY
): (target: target_t) => Result.CreepResult {
	return (target: target_t) => action(target, type, undefined);
}

export const transfer = bindResourceAction(Proto.Creep.prototype.transfer);
export const withdraw = bindResourceAction(Proto.Creep.prototype.withdraw);
