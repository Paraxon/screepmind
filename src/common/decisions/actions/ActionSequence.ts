import { Logger } from "common/patterns/Logger";
import { Verbosity } from "common/patterns/Verbosity";
import { Action } from "../DecisionMaker";

export class ActionSequence<actor_t, result_t = void> implements Action<actor_t, result_t> {
	private actions = new Array<Action<actor_t, result_t>>();
	private index = 0;
	public constructor(...actions: Action<actor_t, result_t>[]) {
		this.actions = actions.filter(action => action != undefined);
	}
	public decide(actor: actor_t): Action<actor_t, result_t> {
		return new ActionSequence(...this.actions.map(action => action.decide(actor)));
	}
	public canDoBoth(other: Action<actor_t, result_t>): boolean {
		return this.actions.every(action => action.canDoBoth(other));
	}
	public isComplete(actor: actor_t): boolean {
		return this.index >= this.actions.length;
	}
	public then(action: Action<actor_t, result_t> | undefined): ActionSequence<actor_t, result_t> {
		action && this.actions.push(action);
		return this;
	}
	public reduce(): Action<actor_t, result_t> | undefined {
		switch (this.actions.length) {
			case 0:
				return undefined;
			case 1:
				return this.actions[0];
			default:
				return this;
		}
	}
	public execute(actor: actor_t): result_t | undefined {
		let result: result_t | undefined;
		for (let action = this.current; !this.isComplete(actor); action = this.next) {
			// If the action is already complete before execution, skip it
			if (action?.isComplete(actor)) continue;
			result = action?.execute(actor);
			// If the action is not complete after execution, break out of the loop
			if (!action?.isComplete(actor)) break;
		}
		return result;
	}
	private get current(): Action<actor_t, result_t> | undefined {
		return this.actions[this.index];
	}
	private get next(): Action<actor_t, result_t> | undefined {
		this.index++;
		return this.current;
	}
}
