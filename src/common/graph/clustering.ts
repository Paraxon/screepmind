import { Cluster } from "./cluster.js";
import { DiGraph } from "./digraph.js";
import Flatten from "@flatten-js/core";
import { VertexRecord } from "./span.js";

export class KMeans {
	private clusters = new Array<Cluster>();
	private stable: number;
	private iterations: number;
	private graph: DiGraph<Flatten.Point>;
	public constructor(graph: DiGraph<Flatten.Point>, size: number, iterations = 3, stable = Infinity) {
		this.graph = graph;
		this.iterations = iterations;
		this.stable = stable;
		for (const vertex of graph.sample(size)) this.clusters.push(new Cluster(vertex));
	}
	public execute(steps: number): Array<Cluster> {
		for (let i = 0; i < steps; i++) {
			const cluster = this.next();
			if (!cluster) this.reset();
			else this.assign(cluster);
		}
		return this.clusters;
	}
	public assign(cluster: Cluster) {
		const current = cluster.span.pop()!;
		for (const edge of this.graph.edgesFrom(current.vertex)) {
			const cost = current.cost + edge.cost;
			const closed = this.clusters.find(cluster => cluster.span.findClosed(record => record.vertex.equalTo(edge.to)));
			if (closed) {
				const exsisting = closed.span.findClosed(record => record.vertex.equalTo(edge.to))!;
				if (exsisting.cost <= cost) continue;
				else closed.span.reopen(exsisting);
			}
			else {
				const open = this.clusters.find(cluster => cluster.span.findOpen(record => record.vertex.equalTo(edge.to)));
				if (open) {
					const exsisting = open.span.findOpen(record => record.vertex.equalTo(edge.to))!;
					if (exsisting.cost <= cost) continue;
					else open.span.remove(exsisting);
				}
			}
			cluster.span.push(new VertexRecord(edge.to, edge, cost));
		}
		cluster.span.close(current);
	}
	public reset() {
		let max = 0;
		for (let i = 0; i < this.clusters.length; i++) {
			const cluster = this.clusters[i];
			const centroid = cluster.centroid;
			let root: Flatten.Point;
			let cost = 0;
			const child = cluster.span.findClosed(record => record.vertex.equalTo(centroid));
			if (child) {
				root = child.vertex;
				cost = child.cost;
			}
			else if (this.graph.contains(centroid)) {
				root = centroid;
				cost = Infinity;
			}
			else {
				root = Array.from(cluster.span.closed).reduce((avg, curr) => centroid.distanceTo(avg.vertex) < centroid.distanceTo(curr.vertex) ? avg : curr).vertex;
				cost = Infinity;
			}
			max = Math.max(cost, max);
			this.clusters[i] = new Cluster(root);
		}
		return max;
	}
	public next() {
		if (this.clusters.every(cluster => cluster.span.finished)) return null;
		return this.clusters
			.filter(cluster => cluster.span.peek())
			.reduce((min, current) => {
				return min.span.peek()!.cost < current.span.peek()!.cost ? min : current;
			});
	}
}
