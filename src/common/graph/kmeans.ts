import { DiGraph } from "./digraph.js";
import Flatten from "@flatten-js/core";
import { Region } from "./region.js";
import { Summary } from "common/statistics/summary.js";
import { VertexRecord } from "./vertexrecord.js";

export class KMeans {
	public regions = new Array<Region>();
	private stable: number;
	private iterations: number;
	private graph: DiGraph<Flatten.Point>;
	public constructor(graph: DiGraph<Flatten.Point>, size: number, iterations = 3, stable = Infinity) {
		this.graph = graph;
		this.iterations = iterations;
		this.stable = stable;
		for (const vertex of graph.sample(size)) this.regions.push(new Region(vertex));
	}
	public execute(): Region[] {
		for (let i = 1; i < this.iterations; i++) {
			this.step();
			// if (this.reset() <= this.stable) break;
			this.reset();
		}
		this.step();
		return this.regions;
	}
	public step() {
		let region: Region | null;
		while ((region = this.next())) this.assign(region);
		console.log(new Summary(this.regions.map(current => current.span.size)));
	}
	public assign(region: Region) {
		const current = region.span.pop();
		for (const edge of this.graph.edgesFrom(current.vertex)) {
			const cost = current.cost + edge.cost;
			let existing: VertexRecord<Flatten.Point> | undefined;
			const closed = this.regions.find(cluster => (existing = cluster.span.findClosed(edge.to)));
			if (closed) {
				if (existing!.cost <= cost) continue;
				else closed.span.removeClosed(existing!);
			} else {
				const open = this.regions.find(cluster => (existing = cluster.span.findOpen(edge.to)));
				if (open) {
					if (existing!.cost <= cost) continue;
					else open.span.removeOpen(existing!);
				}
			}
			region.span.insertOpen(new VertexRecord(edge.to, edge, cost));
		}
		region.span.insertClosed(current);
	}
	public reset() {
		let max = 0;
		for (let i = 0; i < this.regions.length; i++) {
			const cluster = this.regions[i];
			const centroid = cluster.centroid;
			let root: Flatten.Point;
			let cost = 0;
			const child = cluster.span.findClosed(centroid);
			if (child) {
				root = child.vertex;
				cost = child.cost;
			} else if (this.graph.contains(centroid)) {
				root = centroid;
				cost = Infinity;
			} else {
				const closed: VertexRecord<Flatten.Point>[] = Array.from(cluster.span.closed);
				const closest = closed.reduce((best, current) =>
					centroid.distanceTo(best.vertex) < centroid.distanceTo(current.vertex) ? best : current
				);
				root = closest.vertex;
				cost = Infinity;
			}
			max = Math.max(cost, max);
			this.regions[i] = new Region(root);
		}
		return max;
	}
	public next() {
		if (this.regions.every(cluster => cluster.span.finished)) return null;
		return this.regions
			.filter(cluster => cluster.span.peek())
			.reduce((min, current) => {
				return min.span.peek()!.cost < current.span.peek()!.cost ? min : current;
			});
	}
}
