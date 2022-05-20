import { State } from "common/decisions/StateMachine";
import { DiGraph, DirectedEdge, Edge, Weighted } from "./Digraph";

export class AdjList<vertex_t, edge_t extends DirectedEdge<vertex_t>> implements DiGraph<vertex_t, edge_t> {
	private _vertices: vertex_t[];
	private _edges: edge_t[];

	public constructor(vertices: vertex_t[] = new Array<vertex_t>(), edges: edge_t[] = new Array<edge_t>()) {
		this._vertices = vertices;
		this._edges = edges;
	}
	public vertices() {
		return this._vertices;
	}
	public edgesFrom(from: vertex_t) {
		return this._edges.filter(edge => edge.from === from);
	}
	public edgesTo(to: vertex_t) {
		return this._edges.filter(edge => edge.to === to);
	}
	public sample(count: number) {
		const sample = new Array<vertex_t>(count);
		for (let i = 0; i < count; i++) sample[i] = this._vertices[Math.floor(Math.random() * this._vertices.length)];
		return sample;
	}
	public contains(vertex: vertex_t): boolean {
		return this._vertices.includes(vertex);
	}
	addVertex(vertex: vertex_t): AdjList<vertex_t, edge_t> {
		this._vertices.push(vertex);
		return this;
	}
}
