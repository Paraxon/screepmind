export interface DecisionMaker<actor_t, result_t = void> {
	decide(actor: actor_t): Action<actor_t, result_t> | undefined;
}

export interface Action<actor_t, result_t = void> {
	decide(actor: actor_t): Action<actor_t, result_t>;
	execute(actor: actor_t): result_t | undefined;
	canDoBoth(other: Action<actor_t, result_t>): boolean;
	isComplete(actor: actor_t): boolean;
}
