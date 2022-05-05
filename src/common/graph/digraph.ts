import Flatten from "@flatten-js/core";
import { Visual } from "game/visual";

export class Edge<T> {
	from: T;
	to: T;
	cost: number;
	constructor(from: T, to: T, cost: number) {
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

export class AdjList<vertex_t> implements DiGraph<vertex_t> {
	private _vertices: Array<vertex_t>;
	private edges: Array<Edge<vertex_t>>;

	constructor(vertices: Array<vertex_t>, edges: Array<Edge<vertex_t>>) {
		this._vertices = vertices;
		this.edges = edges;
	}
	vertices() {
		return this._vertices;
	}
	edgesFrom(from: vertex_t) {
		return this.edges.filter((edge) => edge.from === from);
	}
	edgesTo(to: vertex_t) {
		return this.edges.filter((edge) => edge.to === to);
	}
	sample(count: number) {
		const sample = new Array<vertex_t>(count);
		for (let i = 0; i < count; i++)
			sample[i] = this._vertices[Math.floor(Math.random() * this._vertices.length)];
		return sample;
	}
	contains(vertex: vertex_t): boolean {
		return this._vertices.includes(vertex);
	}
}

export function drawConnections(graph: DiGraph<Flatten.Point>, vertex: Flatten.Point, visual: Visual, vertexStyle: CircleStyle = {}, edgeStyle: LineStyle = {}) {
	// Draw vertex
	visual.circle(vertex, vertexStyle);

	// Incoming edges
	let connections = new Map();
	for (const edge of graph.edgesTo(vertex)) connections.set(JSON.stringify(edge.from), { incoming: edge.cost });

	// Outgoing edges
	for (const edge of graph.edgesFrom(vertex)) {
		const key = JSON.stringify(edge.to);
		if (connections.has(key)) connections.get(key).outgoing = edge.cost;
		else connections.set(key, { outgoing: edge.cost });
	}

	// Draw edges
	for (const [neighbour, connection] of connections.entries()) {
		if (connection.incoming && connection.incoming == connection.outgoing) edgeStyle.lineStyle = undefined; // Solid
		else edgeStyle.lineStyle = "dashed";
		visual.line(vertex, JSON.parse(neighbour), edgeStyle);
	}
}
