export interface Action<actor_t, result_t = void> {
	execute(actor: actor_t): result_t | undefined;
	canDoBoth(other: Action<actor_t, result_t>): boolean;
	isComplete(actor: actor_t): boolean;
}
