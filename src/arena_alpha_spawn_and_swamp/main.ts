import { ActionSequence } from "common/actions/ActionSequence";
import { DepositResource, MoveToNearest, MoveToTarget, WithdrawResource } from "common/actions/CreepAction";
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
const isNextToSpawn = new InRangeOf(StructureSpawn, 1, spawn => spawn.my);
const isNextToContainer = new InRangeOf(StructureContainer, 1, container => container.store.energy > 0);
const isFull = new Full(RESOURCE_ENERGY);

const moveToContainer = new MoveToNearest(StructureContainer, 1, (container: StructureContainer) => container.store.energy > 0);
const withdrawEnergy = new WithdrawResource(RESOURCE_ENERGY);
const getEnergy = new ActionSequence(moveToContainer, withdrawEnergy);

const moveToSpawn = new MoveToNearest(StructureSpawn, 1, spawn => spawn.my);
const depositEnergy = new DepositResource(RESOURCE_ENERGY);
const deliverEnergy = new ActionSequence(moveToSpawn, depositEnergy);

const ai = new DecisionTree(isFull, deliverEnergy, getEnergy);

export function loop() {
	switch (getTicks()) {
		case 1:
			console.log(JSON.stringify(getEnergy));
			const spawn = getObjectsByPrototype(StructureSpawn).filter(entity => entity.my)[0];
			const ratio = new BodyRatio().with(CARRY, 2).withSpeed(1, FATIGUE_FACTOR[TERRAIN_PLAIN]);
			const result = spawn.spawnCreep(ratio.spawn);
			break;
		default:
			break;
	}

	if (getTicks() >= 12) {
		const lad = getObjectsByPrototype(Creep).filter(creep => creep.my)[0] as CreepMind;
		const action = ai.decide(lad);
		action?.execute(lad);
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
