import { DecisionMaker } from "common/decisions/DecisionMaker";
import { Action } from "./Action";

export class ActionCombination<actor_t, result_t = void>
	implements Action<actor_t, result_t>, DecisionMaker<actor_t, result_t>
{
	private actions = new Array<Action<actor_t, result_t>>();
	public constructor(...actions: Action<actor_t, result_t>[]) {
		this.actions = actions;
	}
	public decide(actor: actor_t): Action<actor_t, result_t> {
		return new ActionCombination(...this.actions.map(action => action.decide(actor)));
	}
	public execute(actor: actor_t): result_t | undefined {
		let result: result_t | undefined;
		this.actions.filter(action => !action.isComplete(actor)).forEach(action => (result = action.execute(actor)));
		return result;
	}
	public canDoBoth(other: Action<actor_t, result_t>): boolean {
		return this.actions.every(action => action.canDoBoth(other));
	}
	public isComplete(actor: actor_t): boolean {
		return this.actions.every(action => action.isComplete(actor));
	}
	public reduce(): Action<actor_t, result_t> | undefined {
		switch (this.actions.length) {
			case 0: return undefined;
			case 1: return this.actions[0];
			default: return this;
		}
	}
}
