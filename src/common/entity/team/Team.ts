import { Classifier } from "common/classification/Classifier";
import { Prototype } from "common/Library";
import { Logger } from "common/patterns/Logger";
import { ATTACK, CARRY, RANGED_ATTACK, RESOURCE_ENERGY, WORK } from "game/constants";
import { Creep, GameObject, ResourceType, StructureSpawn } from "game/prototypes";
import { getObjectsByPrototype } from "game/utils";
import { CreepClassifier } from "../creep/CreepClassifier";

export interface OwnedGameObject extends GameObject {
	my?: boolean;
}

export const classifier = new CreepClassifier();
classifier.add("harvester").set(WORK, 1);
classifier.add("melee").set(ATTACK, 1);
classifier.add("harvester").set(WORK, 1);
classifier.add("hauler").set(CARRY, 1);
classifier.add("builder").set(CARRY, 1).set(WORK, 1);
classifier.add("combat").set(ATTACK, 1).set(RANGED_ATTACK, 1);
classifier.add("shooter").set(RANGED_ATTACK, 1);

export class Team {
	my: boolean | undefined;
	public constructor(my: boolean | undefined = true) {
		this.my = my;
	}
	public get Creeps() {
		return this.GetAll(Creep).filter(creep => !creep.spawning);
	}
	public GetAll<object_t extends OwnedGameObject>(prototype: Prototype<object_t>): object_t[] {
		return getObjectsByPrototype(prototype).filter(object => object.my === this.my);
	}
	public GetFirst<object_t extends OwnedGameObject>(prototype: Prototype<object_t>): object_t | undefined {
		return getObjectsByPrototype(prototype).find(object => object.my === this.my);
	}
	public LocalInventory(resource: ResourceType = RESOURCE_ENERGY): number {
		return this.GetAll(StructureSpawn)
			.map(spawn => spawn.store.getUsedCapacity(resource) ?? 0)
			.reduce((max, current) => Math.max(max, current));
	}
	public GlobalInventory(resource: ResourceType = RESOURCE_ENERGY): number {
		return this.GetAll(StructureSpawn)
			.map(spawn => spawn.store.getUsedCapacity(resource) ?? 0)
			.reduce((sum, current) => sum + current);
	}
	public FindRole(role: string, membership: number = 1): Creep[] {
		return this.Creeps.filter(creep => classifier.classify(creep).test(role) >= membership);
	}
	public CanAfford(cost: number, resource: ResourceType = RESOURCE_ENERGY): boolean {
		return this.GlobalInventory(resource) >= cost;
	}
	public get Population(): number {
		return this.GetAll(Creep).length;
	}
}

export const TEAM_FRIENDLY = new Team(true);
export const TEAM_ENEMY = new Team(false);
export const TEAM_NEUTRAL = new Team(undefined);