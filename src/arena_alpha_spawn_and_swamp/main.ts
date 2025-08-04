import { Arbiter } from "common/decisions/Blackboard";
import { TEAM_FRIENDLY, Team } from "common/entity/team/Team";
import { Population } from "common/entity/team/experts/Population";
import { ScreepsReturnCode } from "common/gameobject/ReturnCode";
import { Speech } from "common/gameobject/Speech";
import { classifier } from "common/gameobject/creep/Roles";
import { AdjList } from "common/graph/AdjacencyList";
import { Border, ConnectRegions } from "common/graph/Hierarchy";
import { KMeans } from "common/graph/kmeans";
import { Region } from "common/graph/region";
import { TileGraph } from "common/graph/tilegraph";
import { Logger } from "common/patterns/Logger";
import { Verbosity } from "common/patterns/Verbosity";
import * as Consts from "game/constants";
import { getTicks } from "game/utils";
import { LineVisualStyle, Visual } from "game/visual";

const kmeans = new KMeans(new TileGraph(), 33, 4);
let regions: AdjList<Region, Border>;

const strategy = new Arbiter<Team, ScreepsReturnCode>();
strategy.experts.push(new Population());
// strategy.experts.push(new Economy());
// strategy.experts.push(new Military());
// strategy.experts.push(new Construction());

export function loop() {
	const visual = new Visual();
	Speech.draw(visual);
	switch (getTicks()) {
		case 1:
			Logger.verbosity = Verbosity.Trace;
			regions = ConnectRegions(new TileGraph(), kmeans.execute());
		default:
			const action = strategy.decide(TEAM_FRIENDLY);
			if (!action) Logger.log('action', "no actions were decided for the team");
			const result = action?.execute(TEAM_FRIENDLY);
			if (result ?? Consts.OK < 0) Logger.log('error', `team action returned error ${result}`, Verbosity.Error);
			break;
	}
	drawRegions(visual);
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
