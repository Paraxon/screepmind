import { Action } from "common/actions/Action";
import { ActionSequence } from "common/actions/ActionSequence";
import { Condition } from "common/conditions/Condition";
import { AdjList } from "common/graph/AdjacencyList";
import { DiGraph, DirectedEdge } from "common/graph/Digraph";
import { DecisionMaker } from "./DecisionMaker";

export interface Stateful<actor_t, result_t> {
	getState(stateMachine: StateMachine<actor_t & Stateful<actor_t, result_t>, result_t>): State<actor_t, result_t>;
	setState(state: State<actor_t, result_t>): void;
}

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

export class StateMachine<actor_t extends Stateful<actor_t, result_t>, result_t> implements DecisionMaker<actor_t, result_t>
{
	public graph: DiGraph<State<actor_t, result_t>, Transition<actor_t, result_t>>;
	public initial: State<actor_t, result_t>;
	constructor(initial: State<actor_t, result_t>, graph?: DiGraph<State<actor_t, result_t>, Transition<actor_t, result_t>>) {
		this.initial = initial;
		this.graph = graph ?? new AdjList<State<actor_t, result_t>, Transition<actor_t, result_t>>();
		graph ?? this.graph.addVertex(initial);
	}
	decide(actor: actor_t): Action<actor_t, result_t> | undefined {
		if (!this.graph.contains(actor.getState(this)))
			actor.setState(this.initial);
		const current = actor.getState(this);
		const transition = Array.from(this.graph.edgesFrom(current))
			.find(transition => transition.condition.evaluate(actor));
		if (!transition) return current.body?.decide(actor);
		actor.setState(transition.to);
		return new ActionSequence<actor_t, result_t>()
			.then(transition.from.body?.decide(actor))
			.then(transition.logic?.decide(actor))
			.then(transition.to.entry?.decide(actor))
			.reduce();
	}
}