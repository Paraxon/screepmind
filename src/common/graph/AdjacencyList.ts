import { DiGraph, Edge } from "./Digraph";

export class AdjList<vertex_t> implements DiGraph<vertex_t> {
	private verts: vertex_t[];
	private edges: Edge<vertex_t>[];

	public constructor(vertices: vertex_t[], edges: Edge<vertex_t>[]) {
		this.verts = vertices;
		this.edges = edges;
	}
	public vertices() {
		return this.verts;
	}
	public edgesFrom(from: vertex_t) {
		return this.edges.filter(edge => edge.from === from);
	}
	public edgesTo(to: vertex_t) {
		return this.edges.filter(edge => edge.to === to);
	}
	public sample(count: number) {
		const sample = new Array<vertex_t>(count);
		for (let i = 0; i < count; i++) sample[i] = this.verts[Math.floor(Math.random() * this.verts.length)];
		return sample;
	}
	public contains(vertex: vertex_t): boolean {
		return this.verts.includes(vertex);
	}
}
