import * as Actions from "common/actions/Intent";
import { ATTACK, BodyPartConstant, CARRY, HEAL, RANGED_ATTACK, WORK } from "game/constants";
import { Creep, GameObject, StructureContainer, StructureSpawn } from "game/prototypes";
import { FATIGUE_FACTOR, TERRAIN_PLAIN } from "common/Library";
import { getObjectsByPrototype, getRange, getTicks } from "game";
import { BodyRatio } from "common/BodyRatio";
import { CreepClassifier } from "common/statistics/Classifier";
import { DecisionTree } from "common/decisions/DecisionTree";

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
	const containers = getObjectsByPrototype(StructureContainer).filter(
		container => container.my || container.my === undefined
	);
	const friendlies = getObjectsByPrototype(Creep).filter(creep => creep.my);
	const spawn = getObjectsByPrototype(StructureSpawn).filter(entity => entity.my)[0];

	if (getTicks() === 1) {
		const ratio = new BodyRatio().with(CARRY, 2).withSpeed(1, FATIGUE_FACTOR[TERRAIN_PLAIN]);
		const result = spawn.spawnCreep(ratio.spawn);
		if (typeof result.object !== undefined) {
			const memory = result.object as CreepMind;
			memory.target = "hello world!";
		}
	} else {
		const memory = friendlies[0] as CreepMind;
		console.log(memory.target);
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
