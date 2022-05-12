import { BodyRatio } from "common/BodyRatio";
import { Empty, Full, InRangeOf } from "common/conditions/CreepConditions";
import { DecisionTree } from "common/decisions/DecisionTree";
import { FATIGUE_FACTOR, TERRAIN_PLAIN } from "common/Library";
import { CreepClassifier } from "common/statistics/Classifier";
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
import { Creep, GameObject, StructureContainer, StructureSpawn } from "game/prototypes";

const classifier = new CreepClassifier();
classifier.classifications.set("archer", new Map<BodyPartConstant, number>().set(RANGED_ATTACK, 1));
classifier.classifications.set("harvester", new Map<BodyPartConstant, number>().set(WORK, 1));
classifier.classifications.set("melee", new Map<BodyPartConstant, number>().set(ATTACK, 1));
classifier.classifications.set("support", new Map<BodyPartConstant, number>().set(HEAL, 1));
classifier.classifications.set("porter", new Map<BodyPartConstant, number>().set(CARRY, 1));
classifier.classifications.set("builder", new Map<BodyPartConstant, number>().set(WORK, 1));

export class CreepMind extends Creep {
	public target?: GameObject | null;
}

export function loop() {
	if (getTicks() === 1) {
		const spawn = getObjectsByPrototype(StructureSpawn).filter(entity => entity.my)[0];
		const ratio = new BodyRatio().with(CARRY, 2).withSpeed(1, FATIGUE_FACTOR[TERRAIN_PLAIN]);
		const result = spawn.spawnCreep(ratio.spawn);
		console.log(result);
	}

	if (getTicks() >= 12) {
		const nextToSpawn = new InRangeOf(StructureSpawn, 1, spawn => spawn.my);
		const nextToContainer = new InRangeOf(StructureContainer, 1, container => container.store.energy > 0);
		const full = new Full(RESOURCE_ENERGY);

		const lad = getObjectsByPrototype(Creep).filter(creep => creep.my)[0] as CreepMind;
		// sequence.execute(lad);
		console.log(`Target: ${lad.target?.id ?? "none"}`);
	}

	/* const deposit = new Actions.Transfer();
	const moveToSpawn = new Actions.MoveTo();
	const moveToContainer = new Actions.MoveTo();
	const pickupEnergy = new Actions.Pickup();
	const isFull = (creep: Creep) => creep.store.getFreeCapacity() === 0;
	const nextToSpawn = (creep: Creep) => getRange(creep, spawn) <= 1;
	const nextToContainer = (creep: Creep) => containers.some(container => getRange(creep, container) <= 1);
	const deliverEnergy = new DecisionTree(nextToSpawn, deposit, moveToSpawn);
	const getEnergy = new DecisionTree(nextToContainer, pickupEnergy, moveToContainer);
	const harvester = new DecisionTree(isFull, deliverEnergy, getEnergy);

	const porters = frendlies.filter(creep => classifier.classify(creep).get("porter") || 0 >= 0);
	porters.forEach(creep => console.log(harvester.decide(creep))); */
}
