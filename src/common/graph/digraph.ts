import Flatten from "@flatten-js/core";
import { Visual } from "game/visual";

export class Edge<T> {
	public from: T;
	public to: T;
	public cost: number;
	public constructor(from: T, to: T, cost: number) {
		this.from = from;
		this.to = to;
		this.cost = cost;
	}
}

export interface DiGraph<vertex_t> {
	vertices(): Iterable<vertex_t>;
	edgesFrom(vertex: vertex_t): Iterable<Edge<vertex_t>>;
	edgesTo(vertex: vertex_t): Iterable<Edge<vertex_t>>;
	sample(count: number): Iterable<vertex_t>;
	contains(vertex: vertex_t): boolean;
}

export function drawConnections(
	graph: DiGraph<Flatten.Point>,
	vertex: Flatten.Point,
	visual: Visual,
	vertexStyle: CircleStyle = {},
	edgeStyle: LineStyle = {}
) {
	// Draw vertex
	visual.circle(vertex, vertexStyle);

	interface Relationship {
		incoming: number | undefined;
		outgoing: number | undefined;
	}

	// Incoming edges
	const connections = new Map<string, Relationship>();
	for (const edge of graph.edgesTo(vertex))
		connections.set(JSON.stringify(edge.from), { incoming: edge.cost, outgoing: undefined });

	// Outgoing edges
	for (const edge of graph.edgesFrom(vertex)) {
		const key = JSON.stringify(edge.to);
		if (connections.has(key)) connections.set(key, { outgoing: edge.cost, incoming: connections.get(key)?.incoming });
		else connections.set(key, { outgoing: edge.cost, incoming: undefined });
	}

	// Draw edges
	for (const [neighbour, connection] of connections.entries()) {
		if (connection.incoming && connection.incoming === connection.outgoing) edgeStyle.lineStyle = undefined; // Solid
		else edgeStyle.lineStyle = "dashed";
		visual.line(vertex, JSON.parse(neighbour) as Flatten.Point, edgeStyle);
	}
}
