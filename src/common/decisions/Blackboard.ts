import { Action } from "./DecisionMaker";
import { DecisionMaker } from "./DecisionMaker";
import { ActionCombination } from "./actions/ActionCombination";

export interface Expert<actor_t, result_t> {
	insistence(actor: actor_t, board: Blackboard<actor_t, result_t>): number;
	write(actor: actor_t, board: Blackboard<actor_t, result_t>): void;
}

export class Blackboard<actor_t, result_t> {
	data = new Map<string, any>();
	actions = new Array<Action<actor_t, result_t>>();
	action(): Action<actor_t, result_t> {
		return new ActionCombination<actor_t, result_t>(this.actions[0], ...this.actions.slice(1));
	}
	clear(): void {
		this.data.clear();
		this.actions.splice(0, this.actions.length);
	}
}

export class Arbiter<actor_t, result_t> implements DecisionMaker<actor_t, result_t> {
	public experts = new Array<Expert<actor_t, result_t>>();
	decide(actor: actor_t): Action<actor_t, result_t> {
		const board = new Blackboard<actor_t, result_t>();
		// this.arbitrate(actor, board)?.write(actor, board);
		this.experts.filter(expert => expert.insistence(actor, board) > 0).forEach(expert => expert.write(actor, board));
		return board.action();
	}
	arbitrate(actor: actor_t, board: Blackboard<actor_t, result_t>): Expert<actor_t, result_t> | undefined {
		return this.experts.reduce((best, next) =>
			best.insistence(actor, board) > next.insistence(actor, board) ? best : next
		);
	}
}
