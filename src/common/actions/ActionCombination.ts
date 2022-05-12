import { Action } from "./Action";

export class ActionCombination<actor_t, result_t = void> implements Action<actor_t, result_t> {
	private actions = new Array<Action<actor_t, result_t>>();
	public constructor(...actions: Action<actor_t, result_t>[]) {
		this.actions = actions;
	}
	public execute(actor: actor_t): result_t | undefined {
		let result: result_t | undefined;
		this.actions.filter(action => !action.isComplete(actor)).every(action => (result = action.execute(actor)));
		return result;
	}
	public canDoBoth(other: Action<actor_t, result_t>): boolean {
		return this.actions.every(action => action.canDoBoth(other));
	}
	public isComplete(actor: actor_t): boolean {
		return this.actions.every(action => action.isComplete(actor));
	}
}
