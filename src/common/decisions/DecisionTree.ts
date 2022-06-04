import { Condition } from "common/decisions/Condition";
import { DecisionMaker } from "./DecisionMaker";

export class DecisionTree<actor_t, return_t = void> implements DecisionMaker<actor_t, return_t> {
	public condition: Condition<actor_t>;
	public truthy: DecisionMaker<actor_t, return_t>;
	public falsy: DecisionMaker<actor_t, return_t>;
	public constructor(
		condition: Condition<actor_t>,
		truthy: DecisionMaker<actor_t, return_t>,
		falsy: DecisionMaker<actor_t, return_t>
	) {
		this.condition = condition;
		this.truthy = truthy;
		this.falsy = falsy;
	}
	public decide(actor: actor_t) {
		return this.condition.evaluate(actor) ? this.truthy.decide(actor) : this.falsy.decide(actor);
	}
}
