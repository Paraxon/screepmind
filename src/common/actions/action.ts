export interface Action<actor_t, result_t = void> {
	execute(actor: actor_t): result_t;
}
