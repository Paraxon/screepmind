import { Classifier } from "common/classification/Classifier";
import { Constructor } from "common/Library";
import { RESOURCE_ENERGY } from "game/constants";
import { Creep, GameObject, ResourceType, StructureSpawn } from "game/prototypes";
import { getObjectsByPrototype } from "game/utils";

export interface OwnedGameObject extends GameObject {
	my?: boolean;
}

export class Team {
	my: boolean | undefined;
	public constructor(my: boolean | undefined = true) {
		this.my = my;
	}
	public GetAll<object_t extends OwnedGameObject>(prototype: Constructor<object_t>): object_t[] {
		return getObjectsByPrototype(prototype).filter(object => object.my === this.my);
	}
	public GetFirst<object_t extends OwnedGameObject>(prototype: Constructor<object_t>): object_t | undefined {
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
	public FindRole(classifier: Classifier<Creep>, role: string, membership: number = 1): Creep[] {
		return this.GetAll(Creep).filter(creep => classifier.classify(creep).test(role) >= membership);
	}
	public CanAfford(cost: number, resource: ResourceType = RESOURCE_ENERGY): boolean {
		return this.GlobalInventory(resource) >= cost;
	}
	public get Population(): number {
		return this.GetAll(Creep).length;
	}
}
