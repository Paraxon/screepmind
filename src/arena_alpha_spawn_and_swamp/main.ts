import { ActionSequence } from "common/actions/ActionSequence";
import { DepositResource, HarvestResource, MoveToNearest, MoveToTarget, WithdrawResource } from "common/actions/creep/CreepAction";
import { BodyRatio } from "common/BodyRatio";
import { Empty, Full, InRangeOf } from "common/conditions/CreepConditions";
import { DecisionMaker } from "common/decisions/DecisionMaker";
import { DecisionTree } from "common/decisions/DecisionTree";
import { FATIGUE_FACTOR, TERRAIN_PLAIN } from "common/Library";
import { CreepClassifier, Role } from "common/classification/Classifier";
import * as files from "fs";
import { getObjectsByPrototype, getTicks } from "game";
import {
	ATTACK,
	BodyPartConstant,
	CARRY,
	HEAL,
	RANGED_ATTACK,
	RESOURCE_ENERGY,
	ScreepsReturnCode,
	WORK
} from "game/constants";
import { Creep, GameObject, Source, StructureContainer, StructureSpawn } from "game/prototypes";
import { KMeans } from "common/graph/KMeans";
import { TileGraph } from "common/graph/TileGraph";
import { Region } from "common/graph/Region";
import { Visual } from "game/visual";
import { Edge } from "common/graph/Digraph";
import Flatten from "@flatten-js/core";
import { Border, ConnectRegions } from "common/graph/Hierarchy";
import { AdjList } from "common/graph/AdjacencyList";

const isFull = new Full(RESOURCE_ENERGY);
const withdrawEnergy = new ActionSequence(
	new MoveToNearest(StructureContainer, 1, (container: StructureContainer) => container.store.energy > 0),
	new WithdrawResource(StructureContainer));
const deliverEnergy = new ActionSequence(
	new MoveToNearest(StructureSpawn, 1, spawn => spawn.my),
	new DepositResource(StructureSpawn));
const porter = new DecisionTree(isFull, deliverEnergy, withdrawEnergy);

const harvestEnergy = new ActionSequence(
	new MoveToNearest(Source),
	new HarvestResource());
const harvester = new DecisionTree(isFull, deliverEnergy, harvestEnergy);

const classifier = new CreepClassifier();
// classifier.classifications.set("archer", new Map<BodyPartConstant, number>().set(RANGED_ATTACK, 1));
classifier.classifications.set(new Role("harvester", harvester), new Map<BodyPartConstant, number>().set(WORK, 5));
classifier.classifications.set(new Role("melee"), new Map<BodyPartConstant, number>().set(ATTACK, 1));
// classifier.classifications.set("support", new Map<BodyPartConstant, number>().set(HEAL, 1));
classifier.classifications.set(new Role("porter", porter), new Map<BodyPartConstant, number>().set(CARRY, 1));
// classifier.classifications.set("builder", new Map<BodyPartConstant, number>().set(WORK, 1));

const kmeans = new KMeans(new TileGraph(), 50, 3);
let regions: AdjList<Region, Border>;


export class CreepMind extends Creep {
	public target?: GameObject | null;
}

export function loop() {

	switch (getTicks()) {
		case 1:
			regions = ConnectRegions(new TileGraph(), kmeans.execute());
			const spawn = getObjectsByPrototype(StructureSpawn).filter(entity => entity.my)[0];
			const body = new BodyRatio().with(CARRY, 1).with(WORK, 2).withSpeed(2);
			const result = spawn.spawnCreep(body.spawn);
			break;
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

	if (getTicks() >= 12) {
		const lad = getObjectsByPrototype(Creep).filter(creep => creep.my)[0];
		const membership = classifier.classify(lad);
		membership.best?.ai?.decide(lad)?.execute(lad);
	}
}
