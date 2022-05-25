import { BodyRatio } from "common/BodyRatio";
import { CreepClassifier } from "common/classification/CreepClassifier";
import { Role } from "common/classification/Role";
import { AdjList } from "common/graph/AdjacencyList";
import { Border, ConnectRegions } from "common/graph/Hierarchy";
import { KMeans } from "common/graph/KMeans";
import { Region } from "common/graph/Region";
import { TileGraph } from "common/graph/Tilegraph";
import { Logger } from "common/patterns/Logger";
import { Verbosity } from "common/patterns/Verbosity";
import { getObjectsByPrototype, getTicks } from "game";
import {
	ATTACK, CARRY, WORK
} from "game/constants";
import { StructureSpawn } from "game/prototypes";
import { Visual } from "game/visual";

const classifier = new CreepClassifier();
classifier.add(new Role("harvester")).set(WORK, 5);
classifier.add(new Role("melee")).set(ATTACK, 1);
classifier.add(new Role("porter")).set(CARRY, 1);

const kmeans = new KMeans(new TileGraph(), 33, 3);
let regions: AdjList<Region, Border>;

export interface System {
	initialize(): void;
	update(): void;
}

export function loop() {

	switch (getTicks()) {
		case 1:
			Logger.verbosity = Verbosity.Trace;
			regions = ConnectRegions(new TileGraph(), kmeans.execute());
			const spawn = getObjectsByPrototype(StructureSpawn).filter(entity => entity.my)[0];
			const body = new BodyRatio().with(CARRY, 1).withSpeed(2);
			const result = spawn.spawnCreep(body.spawn);
		default:
			break;
	}

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

	/* if (getTicks() >= 12) {
		const lad = getObjectsByPrototype(Creep).filter(creep => creep.my)[0] as CreepMind;
		const membership = classifier.classify(lad);
		Logger.log("classification", `Creep #${lad.id} is a ${membership.best?.name}`, Verbosity.Critical);
		lad.getState();
		membership.best?.ai?.decide(lad)?.execute(lad);
	} */
}
