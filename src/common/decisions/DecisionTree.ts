import { DecisionMaker } from "./DecisionMaker";

export class DecisionTree<actor_t, return_t = void> implements DecisionMaker<actor_t, return_t> {
	public condition!: (actor: actor_t) => boolean;
	public truthy!: DecisionMaker<actor_t, return_t>;
	public falsy!: DecisionMaker<actor_t, return_t>;
	public constructor(
		condition: (actor: actor_t) => boolean,
		truthy: DecisionMaker<actor_t, return_t>,
		falsy: DecisionMaker<actor_t, return_t>
	) {
		this.condition = condition;
		this.truthy = truthy;
		this.falsy = falsy;
	}
	public decide(actor: actor_t) {
		return this.condition(actor) ? this.truthy.decide(actor) : this.falsy.decide(actor);
	}
}
