import { Action } from "../DecisionMaker";

export class Idle<actor_t, result_t = void> implements Action<actor_t, result_t> {
	constructor(private readonly result: result_t) {}
	decide(actor: actor_t): Action<actor_t, result_t> {
		return this;
	}
	execute(actor: actor_t): result_t {
		return this.result;
	}
	canDoBoth(other: Action<actor_t, result_t>): boolean {
		return true;
	}
	isComplete(actor: actor_t): boolean {
		return true;
	}
}
