import { Action } from "common/actions/Action";
import { ActionSequence } from "common/actions/ActionSequence";
import { Condition } from "common/conditions/Condition";
import { AdjList } from "common/graph/AdjacencyList";
import { DiGraph, DirectedEdge } from "common/graph/Digraph";
import { DecisionMaker } from "./DecisionMaker";

export class State<actor_t, result_t> {
	public entry?: DecisionMaker<actor_t, result_t>;
	public exit?: DecisionMaker<actor_t, result_t>;
	public body?: DecisionMaker<actor_t, result_t>;
}

export class Transition<actor_t, result_t> implements DirectedEdge<State<actor_t, result_t>> {
	public from: State<actor_t, result_t>;
	public to: State<actor_t, result_t>;
	public condition: Condition<actor_t>;
	public logic?: DecisionMaker<actor_t, result_t>;
	public constructor(from: State<actor_t, result_t>, to: State<actor_t, result_t>, condition: Condition<actor_t>, logic?: DecisionMaker<actor_t, result_t>) {
		this.from = from;
		this.to = to;
		this.condition = condition;
		this.logic = logic;
	}
}

export class StateMachine<actor_t, result_t> implements DecisionMaker<actor_t, result_t>
{
	public current: State<actor_t, result_t>;
	public graph: DiGraph<State<actor_t, result_t>, Transition<actor_t, result_t>>;
	constructor(initial: State<actor_t, result_t>, graph?: DiGraph<State<actor_t, result_t>, Transition<actor_t, result_t>>) {
		this.current = initial;
		this.graph = graph ?? new AdjList<State<actor_t, result_t>, Transition<actor_t, result_t>>();
		graph ?? this.graph.addVertex(initial);
	}
	decide(actor: actor_t): Action<actor_t, result_t> | undefined {
		const transition = Array.from(this.graph.edgesFrom(this.current))
			.find(transition => transition.condition.evaluate(actor));
		if (!transition) return this.current.body?.decide(actor);
		this.current = transition.to;
		return new ActionSequence<actor_t, result_t>()
			.then(transition.from.body?.decide(actor))
			.then(transition.logic?.decide(actor))
			.then(transition.to.entry?.decide(actor))
			.reduce();
	}
}