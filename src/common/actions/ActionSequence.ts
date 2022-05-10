import { Action } from "./Action";

export class ActionSequence<actor_t, result_t = void> implements Action<actor_t, result_t> {
	private actions = new Array<Action<actor_t, result_t>>();
	private index = 0;
	public constructor(...actions: Action<actor_t, result_t>[]) {
		this.actions = actions;
	}
	public canDoBoth(other: Action<actor_t, result_t>): boolean {
		return this.actions.every(action => action.canDoBoth(other));
	}
	public isComplete(): boolean {
		return this.index >= this.actions.length;
	}
	public execute(actor: actor_t): result_t | undefined {
		let result: result_t | undefined;
		for (let action = this.current; action?.isComplete() && !this.isComplete(); this.index++)
			result = action.execute(actor);
		return result;
	}
	private get current(): Action<actor_t, result_t> | undefined {
		return this.actions[this.index];
	}
}
