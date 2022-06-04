/* eslint-disable max-classes-per-file */

export interface Condition<actor_t> {
	evaluate(actor: actor_t): boolean;
}

export class Not<actor_t> implements Condition<actor_t> {
	private delegate: Condition<actor_t>;
	public constructor(delegate: Condition<actor_t>) {
		this.delegate = delegate;
	}
	public evaluate(actor: actor_t): boolean {
		return !this.delegate.evaluate(actor);
	}
}

export class And<actor_t> implements Condition<actor_t> {
	private conditions: Condition<actor_t>[];
	public constructor(...conditions: Condition<actor_t>[]) {
		this.conditions = conditions;
	}
	public evaluate(actor: actor_t): boolean {
		return this.conditions.every(condition => condition.evaluate(actor));
	}
}

export class Or<actor_t> implements Condition<actor_t> {
	private conditions: Condition<actor_t>[];
	public constructor(...conditions: Condition<actor_t>[]) {
		this.conditions = conditions;
	}
	public evaluate(actor: actor_t): boolean {
		return this.conditions.some(condition => condition.evaluate(actor));
	}
}
