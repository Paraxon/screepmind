import { Arbiter } from "common/decisions/Blackboard";
import { Team } from "common/entity/team/Team";
import { AdjList } from "common/graph/AdjacencyList";
import { Border, ConnectRegions } from "common/graph/Hierarchy";
import { KMeans } from "common/graph/KMeans";
import { Region } from "common/graph/Region";
import { TileGraph } from "common/graph/Tilegraph";
import { Logger } from "common/patterns/Logger";
import { Verbosity } from "common/patterns/Verbosity";
import { Economy } from "common/entity/team/experts/Economy";
import { Military } from "common/entity/team/experts/Military";
import { ScreepsReturnCode } from "game/constants";
import { getTicks } from "game/utils";
import { Visual } from "game/visual";

/* export const classifier = new CreepClassifier();
// classifier.add(new Role("harvester")).set(WORK, 5);
classifier.add(new Role("melee")).set(ATTACK, 1);
classifier.add(new Role("hauler", haulerDecisionTree)).set(CARRY, 1);
classifier.add(new Role("builder", builderDecisionTree)).set(CARRY, 1).set(WORK, 1); */

const kmeans = new KMeans(new TileGraph(), 33, 3);
let regions: AdjList<Region, Border>;

export interface System {
	initialize(): void;
	update(): void;
}

const team = new Team();
const enemy = new Team(false);
const strategy = new Arbiter<Team, ScreepsReturnCode>();
strategy.experts.push(new Economy());
strategy.experts.push(new Military());

export function loop() {
	switch (getTicks()) {
		case 1:
			Logger.verbosity = Verbosity.Trace;
			regions = ConnectRegions(new TileGraph(), kmeans.execute());
		default:
			const action = strategy.decide(team);
			action?.execute(team);
			// team.Creeps.forEach(creep => classifier.classify(creep).best?.ai?.decide(creep)?.execute(creep));
			break;
	}
	drawRegions();
}

function drawRegions() {
	const visual = new Visual();
	const borderStyle: LineStyle = {
		color: "#0000ff",
		lineStyle: "dashed",
		opacity: 1 / 4
	};

	regions.vertices().forEach(region => region.draw(visual));
	for (const region of regions.vertices())
		for (const edge of regions.edgesFrom(region))
			visual.line(edge.from, edge.to, borderStyle);
}
