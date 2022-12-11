import { Arbiter } from "common/decisions/Blackboard";
import { Construction } from "common/entity/team/experts/Construction";
import { Economy } from "common/entity/team/experts/Economy";
import { Military } from "common/entity/team/experts/Military";
import { Population } from "common/entity/team/experts/Population";
import { Team, TEAM_FRIENDLY } from "common/entity/team/Team";
import { ScreepsReturnCode } from "common/gameobject/ReturnCode";
import { AdjList } from "common/graph/AdjacencyList";
import { Border, ConnectRegions } from "common/graph/Hierarchy";
import { KMeans } from "common/graph/KMeans";
import { Region } from "common/graph/Region";
import { TileGraph } from "common/graph/Tilegraph";
import { Logger } from "common/patterns/Logger";
import { Verbosity } from "common/patterns/Verbosity";
import * as Consts from "game/constants";
import { getTicks } from "game/utils";
import { LineVisualStyle, Visual } from "game/visual";

const kmeans = new KMeans(new TileGraph(), 33, 4);
let regions: AdjList<Region, Border>;

const strategy = new Arbiter<Team, ScreepsReturnCode>();
strategy.experts.push(new Population());
strategy.experts.push(new Economy());
strategy.experts.push(new Military());
strategy.experts.push(new Construction());

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
	const visual = new Visual();
	drawRegions(visual);
	Logger.draw(visual);
}

function drawRegions(visual = new Visual()) {
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
