import { Edge } from "./digraph";

export class VertexRecord<vertex_t> {
	public vertex: vertex_t;
	public edge?: Edge<vertex_t>;
	public cost;
	public constructor(vertex: vertex_t, edge?: Edge<vertex_t>, cost?: number) {
		this.vertex = vertex;
		this.edge = edge;
		this.cost = cost || 0;
	}
}
