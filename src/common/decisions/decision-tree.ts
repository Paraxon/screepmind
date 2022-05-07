"use strict";

export interface Action<actor_t, result_t = void> {
    execute(actor: actor_t): void;
}

export interface DecisionMaker<actor_t> {
    decide(actor: actor_t): Action<actor_t> | undefined;
}

export class Choice<actor_t> implements DecisionMaker<actor_t> {
    condition!: (actor: actor_t) => boolean;
    truthy!: DecisionMaker<actor_t>;
    falsy!: DecisionMaker<actor_t>;
    constructor(condition: (actor: actor_t) => boolean, truthy: DecisionMaker<actor_t>, falsy: DecisionMaker<actor_t>) {
        this.condition = condition;
        this.truthy = truthy;
        this.falsy = falsy;
    }
    decide(actor: actor_t) {
        return this.condition(actor) ? this.truthy.decide(actor) : this.falsy.decide(actor);
    }
}
