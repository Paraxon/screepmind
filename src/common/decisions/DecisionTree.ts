import { DecisionMaker } from "./DecisionMaker";
import * as Func from "common/Functional";

export class DecisionTree<actor_t, return_t = void> implements DecisionMaker<actor_t, return_t> {
	constructor(
		private condition: Func.Predicate<actor_t>,
		private truthy: DecisionMaker<actor_t, return_t>,
		private falsy: DecisionMaker<actor_t, return_t>
	) {}

	decide(actor: actor_t) {
		return this.condition(actor) ? this.truthy.decide(actor) : this.falsy.decide(actor);
	}
}
