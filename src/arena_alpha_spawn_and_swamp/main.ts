import { Arbiter } from "common/decisions/Blackboard";
import { Economy } from "common/entity/team/experts/Economy";
import { Military } from "common/entity/team/experts/Military";
import { Team, TEAM_FRIENDLY, TEAM_NEUTRAL } from "common/entity/team/Team";
import { AdjList } from "common/graph/AdjacencyList";
import { Border, ConnectRegions } from "common/graph/Hierarchy";
import { KMeans } from "common/graph/KMeans";
import { Region } from "common/graph/Region";
import { TileGraph } from "common/graph/Tilegraph";
import { Logger } from "common/patterns/Logger";
import { Verbosity } from "common/patterns/Verbosity";
import { FindPathOptions, getTicks } from "game/utils";
import { LineVisualStyle, Visual } from "game/visual";
import * as Consts from "game/constants";
import { PATH_COST, Predicate, ScreepsReturnCode } from "common/Library";
import { Targeter } from "common/Targeter";
import { StructureContainer } from "game/prototypes";

const kmeans = new KMeans(new TileGraph(), 33, 4);
let regions: AdjList<Region, Border>;

export interface System {
	initialize(): void;
	update(): void;
}

const strategy = new Arbiter<Team, ScreepsReturnCode>();
strategy.experts.push(new Economy());
strategy.experts.push(new Military());

export function loop() {
	switch (getTicks()) {
		case 1:
			Logger.verbosity = Verbosity.Trace;
			regions = ConnectRegions(new TileGraph(), kmeans.execute());
		default:
			const action = strategy.decide(TEAM_FRIENDLY);
			const result = action?.execute(TEAM_FRIENDLY);
			if (result ?? Consts.OK < 0) Logger.log('error', `action returned error ${result}`, Verbosity.Error);
			break;
	}
	drawRegions();
}

function drawRegions() {
	const visual = new Visual();
	const borderStyle: LineVisualStyle = {
		color: "#0000ff",
		lineStyle: "dashed",
		opacity: 1 / 4
	};

	regions.vertices().forEach(region => region.draw(visual));
	for (const region of regions.vertices())
		for (const edge of regions.edgesFrom(region))
			visual.line(edge.from, edge.to, borderStyle);
}
