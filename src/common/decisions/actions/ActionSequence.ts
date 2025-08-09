import { Action } from "../DecisionMaker";

export class ActionSequence<actor_t, result_t = void> implements Action<actor_t, result_t> {
	private actions: Action<actor_t, result_t>[];
	private index = 0;
	public constructor(action: Action<actor_t, result_t>, ...actions: Action<actor_t, result_t>[]) {
		this.actions = [action, ...actions];
	}
	public decide(actor: actor_t): Action<actor_t, result_t> {
		const clones = this.actions.map(action => action.decide(actor));
		return new ActionSequence(clones[0], ...clones.slice(1));
	}
	public canDoBoth(other: Action<actor_t, result_t>): boolean {
		return this.actions.every(action => action.canDoBoth(other));
	}
	public isComplete(actor: actor_t): boolean {
		return this.index >= this.actions.length;
	}
	public then(action: Action<actor_t, result_t>): ActionSequence<actor_t, result_t> {
		this.actions.push(action);
		return this;
	}
	public flatten(): Action<actor_t, result_t> {
		return this.actions.length > 1 ? this : this.actions[0];
	}
	public execute(actor: actor_t): result_t {
		// execute each action starting from the current index and if it is complete, move to the next. return the result of the last action.
		this.index = Math.min(this.index, this.actions.length - 1);
		let result = this.actions[this.index].execute(actor);
		while (this.actions[this.index].isComplete(actor) && ++this.index < this.actions.length) {
			result = this.actions[this.index].execute(actor);
		}
		return result;
	}
}
