import Flatten from "@flatten-js/core";
import { AdjList } from "./AdjacencyList";
import { DiGraph, DirectedEdge, Edge, Weighted } from "./Digraph";
import { Region } from "./Region";

export class Border implements DirectedEdge<Region>, Weighted {
	private edges = new Array<Edge<Flatten.Point>>();
	public from: Region;
	public to: Region;
	private minCost?: number;
	public get cost(): number {
		return this.minCost ??= this.edges.reduce((min, edge) => Math.min(min, edge.cost), Infinity);
	}
	public constructor(from: Region, to: Region) {
		this.from = from;
		this.to = to;
	}
	public add(edge: Edge<Flatten.Point>) {
		this.edges.push(edge);
	}
}

export function ConnectRegions(graph: DiGraph<Flatten.Point>, regions: Region[]): AdjList<Region, Border> {
	const borders = new Array<Border>();
	for (const region of regions) {
		for (const vertex of region.span.vertices) {
			for (const edge of graph.edgesFrom(vertex)) {
				const owner = regions.find(r => r.span.findClosed(edge.to));
				if (!owner || region == owner) continue;
				let border = borders.find(border => border.from === region && border.to === owner);
				if (!border) {
					border = new Border(region, owner);
					borders.push(border);
				}
				border.add(edge);
			}
		}
	}
	return new AdjList(regions, borders);
}