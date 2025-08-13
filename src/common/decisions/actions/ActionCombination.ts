import { DecisionMaker } from "common/decisions/DecisionMaker";
import { Action } from "../DecisionMaker";

export class ActionCombination<actor_t, result_t = void>
	implements Action<actor_t, result_t>, DecisionMaker<actor_t, result_t>
{
	private actions = new Array<Action<actor_t, result_t>>();
	public constructor(action: Action<actor_t, result_t>, ...actions: Action<actor_t, result_t>[]) {
		this.actions = [action, ...actions];
	}
	public decide(actor: actor_t): Action<actor_t, result_t> {
		const clones = this.actions.map(action => action.decide(actor));
		return new ActionCombination(clones[0], ...clones.slice(1));
	}
	public execute(actor: actor_t): result_t {
		return this.actions
			.filter(action => !action.isComplete(actor))
			.map(action => action.execute(actor))
			.at(-1)!;
	}
	public canDoBoth(other: Action<actor_t, result_t>): boolean {
		return this.actions.every(action => action.canDoBoth(other));
	}
	public isComplete(actor: actor_t): boolean {
		return this.actions.every(action => action.isComplete(actor));
	}
	public flatten(): Action<actor_t, result_t> {
		return this.actions.length > 1 ? this : this.actions[0];
	}
}
