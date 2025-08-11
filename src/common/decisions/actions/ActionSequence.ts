import { Action, DecisionMaker } from "../DecisionMaker";

export class ActionSequence<actor_t, result_t = void>
	implements Action<actor_t, result_t>, DecisionMaker<actor_t, result_t>
{
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
		return this.actions.slice(this.index).every(action => action.canDoBoth(other));
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
		for (const start = this.index; this.index < this.actions.length - 1; ++this.index) {
			const current = this.actions[this.index];
			if (current.isComplete(actor)) continue; // Skip actions that are already complete
			const result = current.execute(actor);
			if (!current.isComplete(actor)) return result; //  Stop if the action is still incomplete after execution
			// Check if the next action can't be done with all of the previously executed actions
			const next = this.actions[this.index + 1];
			if (!this.actions.slice(start, this.index).every(prev => next.canDoBoth(prev))) return result;
		}

		const last = this.actions.at(-1);
		if (!last) throw new Error("ActionSequence has no actions to execute.");
		const result = last.execute(actor);
		// If the last action is complete mark the sequence as complete
		if (last.isComplete(actor)) this.index = this.actions.length;
		return result;
	}
}
