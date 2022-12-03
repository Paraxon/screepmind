import * as Consts from "game/constants";
import * as Lib from "../Library";
import * as Utils from "game/utils";
import { DiGraph, Edge } from "./Digraph";
import { ARENA_SHAPE } from "../Library";
import Flatten from "@flatten-js/core";

export class TileGraph implements DiGraph<Flatten.Point> {
	private bounds: Flatten.Box;
	public constructor(bounds = ARENA_SHAPE) {
		this.bounds = bounds;
	}
	public *vertices() {
		for (let x = 0; x < this.bounds.xmax; x++)
			for (let y = 0; y < this.bounds.ymax; y++) {
				const pos = new Flatten.Point(this.bounds.xmin + x, this.bounds.ymin + y);
				if (Utils.getTerrainAt(pos) === Consts.TERRAIN_WALL) continue;
				else yield pos;
			}
	}
	public *edgesFrom(from: Flatten.Point): Iterable<Edge<Flatten.Point>> {
		if (Utils.getTerrainAt(from) === Consts.TERRAIN_WALL) return;

		for (let dy = -1; dy <= 1; dy++) {
			for (let dx = -1; dx <= 1; dx++) {
				const to = new Flatten.Point(from.x + dx, from.y + dy);
				const terrain = Utils.getTerrainAt(to) as Utils.Terrain;
				if ((dx === 0 && dy === 0) || !this.contains(to)) continue;
				else yield new Edge(from, to, Lib.PATH_COST[terrain]);
			}
		}
	}
	public *edgesTo(to: Flatten.Point): Iterable<Edge<Flatten.Point>> {
		const terrain = Utils.getTerrainAt(to) as Utils.Terrain;
		if (terrain === Consts.TERRAIN_WALL) return;

		for (let dy = -1; dy <= 1; dy++) {
			for (let dx = -1; dx <= 1; dx++) {
				const from = Flatten.point(to.x + dx, to.y + dy);
				if ((dx === 0 && dy === 0) || !from.on(this.bounds) || Utils.getTerrainAt(from) === Consts.TERRAIN_WALL)
					continue;
				else yield new Edge(from, to, Lib.PATH_COST[terrain]);
			}
		}
	}
	public contains(vertex: Flatten.Point) {
		return (
			vertex.x > this.bounds.xmin &&
			vertex.x < this.bounds.xmax &&
			vertex.y > this.bounds.ymin &&
			vertex.y < this.bounds.ymax &&
			Utils.getTerrainAt(vertex) !== Consts.TERRAIN_WALL
		);
	}
	public sample(count: number) {
		const sample = new Array<Flatten.Point>();
		const population = Array.from(this.vertices());
		if (population.length > count)
			for (let i = 0; i < count; i++) sample.push(population[Math.floor(Math.random() * population.length)]);
		else return population;
		return sample;
	}
}
