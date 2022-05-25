import Flatten from "@flatten-js/core";
import { DiGraph } from "common/graph/Digraph";
import { Region } from "common/graph/Region";
import { ArraySpan } from "common/graph/Span/ArraySpan";
import { Span } from "common/graph/Span/Span";
import { getObjectsByPrototype } from "game";
import { Creep, StructureSpawn } from "game/prototypes";
import { Influence } from "./Influence";

export class FrontLine {
	regions: DiGraph<Region>;
	span: Span<Region>;
	delta: number;
	constructor(regions: DiGraph<Region>, delta = 100) {
		this.regions = regions;
		const spawn = getObjectsByPrototype(StructureSpawn).find(spawn => spawn.my);
		const position = Flatten.point(spawn?.x, spawn?.y);
		const home = Array.from(regions.vertices()).find(region => region.hull.contains(position))!;
		this.span = new ArraySpan(home);
		this.delta = delta;
	}
	public get frontier(): Region[] {
		return Array.from(this.span.open).map(record => record.vertex);
	}
	public getInfluence(region: Region): number {
		return getObjectsByPrototype(Creep)
			.filter(creep => region.hull.contains(Flatten.point(creep.x, creep.y)))
			.reduce((sum, creep) => sum + Influence.evaluate(creep), 0);
	}
}