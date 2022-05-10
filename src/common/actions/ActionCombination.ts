import { Action } from "./Action";

export class ActionCombination<actor_t, result_t = void> implements Action<actor_t, result_t> {
	private actions = new Array<Action<actor_t, result_t>>();
	public execute(actor: actor_t): result_t | undefined {
		let result: result_t | undefined;
		this.actions.every(action => (result = action.execute(actor)));
		return result;
	}
	public canDoBoth(other: Action<actor_t, result_t>): boolean {
		return this.actions.every(action => action.canDoBoth(other));
	}
	public isComplete(): boolean {
		return this.actions.every(action => action.isComplete());
	}
}
