export interface Action<actor_t, result_t = void> {
	decide(actor: actor_t): Action<actor_t, result_t>;
	execute(actor: actor_t): result_t | undefined;
	canDoBoth(other: Action<actor_t, result_t>): boolean;
	isComplete(actor: actor_t): boolean;
}

export abstract class FlagAction<actor_t, return_t = void> implements Action<actor_t, return_t> {
	protected complete = false;
	public abstract decide(actor: actor_t): Action<actor_t, return_t>;
	public abstract execute(): return_t | undefined;
	public abstract canDoBoth(other: Action<actor_t, return_t>): boolean;
	public isComplete(): boolean {
		return this.complete;
	}
}