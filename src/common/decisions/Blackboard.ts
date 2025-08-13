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
}

export class Arbiter<actor_t, result_t> implements DecisionMaker<actor_t, result_t> {
	private experts: Expert<actor_t, result_t>[];
	constructor(
		private readonly idle: Action<actor_t, result_t>,
		expert: Expert<actor_t, result_t>,
		...experts: Expert<actor_t, result_t>[]
	) {
		this.experts = [expert, ...experts];
	}
	decide(actor: actor_t): Action<actor_t, result_t> {
		const board = new Blackboard<actor_t, result_t>();
		// this.arbitrate(actor, board)?.write(actor, board);
		this.experts.filter(expert => expert.insistence(actor, board) > 0).forEach(expert => expert.write(actor, board));
		switch (board.actions.length) {
			case 0:
				return this.idle.decide(actor);
			case 1:
				return board.actions[0];
			default:
				return new ActionCombination(board.actions[0], ...board.actions.slice(1));
		}
	}
	arbitrate(actor: actor_t, board: Blackboard<actor_t, result_t>): Expert<actor_t, result_t> | undefined {
		return this.experts.reduce((max, current) =>
			max.insistence(actor, board) > current.insistence(actor, board) ? max : current
		);
	}
}
