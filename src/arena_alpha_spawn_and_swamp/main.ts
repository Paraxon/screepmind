import * as Consts from "game/constants";
import * as Proto from "game/prototypes";
import * as Utils from "game/utils";
import * as Draw from "game/visual";
import { Arbiter } from "../common/decisions/Blackboard";
import { Idle } from "../common/decisions/actions/Idle";
import { TEAM_FRIENDLY, Team } from "../common/entity/team/Team";
import { Population } from "../common/entity/team/experts/Population";
import { ERROR_EMOJI } from "../common/gameobject/Emoji";
import * as Result from "../common/gameobject/Result";
import { Speech } from "../common/gameobject/Speech";
import { AdjList } from "../common/graph/AdjacencyList";
import { Border } from "../common/graph/Hierarchy";
import { KMeans } from "../common/graph/kmeans";
import { Region } from "../common/graph/region";
import { TileGraph } from "../common/graph/tilegraph";
import { Logger } from "../common/patterns/Logger";
import { Verbosity } from "../common/patterns/Verbosity";

const kmeans = new KMeans(new TileGraph(), 33, 4);
let regions: AdjList<Region, Border>;

const idle = new Idle<Team, Result.ScreepsResult>(Consts.OK);
const strategy = new Arbiter<Team, Result.ScreepsResult>(idle, new Population());

export function loop() {
	switch (Utils.getTicks()) {
		case 1:
			start();
		default:
			const action = strategy.decide(TEAM_FRIENDLY);
			if (!action) Logger.log("action", "no actions were decided for the team");
			const result = action?.execute(TEAM_FRIENDLY);
			if (result) Speech.say(TEAM_FRIENDLY.GetFirst(Proto.StructureSpawn)!, ERROR_EMOJI[result]);
			break;
	}
	visualize();
}

function start() {
	Logger.verbosity = Verbosity.Trace;
	// regions = ConnectRegions(new TileGraph(), kmeans.execute());
}

function visualize(visual = new Draw.Visual()) {
	// drawRegions(visual);
	Speech.draw(visual);
}

function drawRegions(visual = new Draw.Visual()) {
	const borderStyle: Draw.LineVisualStyle = {
		color: "#0000ff",
		lineStyle: "dashed",
		opacity: 1 / 4
	};

	regions.vertices().forEach(region => region.draw(visual));
	for (const region of regions.vertices())
		for (const edge of regions.edgesFrom(region)) visual.line(edge.from, edge.to, borderStyle);
}
