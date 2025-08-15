import { Action } from "../DecisionMaker";

export class Idle<actor_t, result_t = void> implements Action<actor_t, result_t> {
	constructor(private readonly result: result_t) {}
	decide(_actor: actor_t): Action<actor_t, result_t> {
		return this;
	}
	execute(_actor: actor_t): result_t {
		return this.result;
	}
	canDoBoth(_other: Action<actor_t, result_t>): boolean {
		return true;
	}
	isComplete(_actor: actor_t): boolean {
		return true;
	}
}
