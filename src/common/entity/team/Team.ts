import { Classifier } from "common/classification/Classifier";
import { Role } from "common/classification/Role";
import { getObjectsByPrototype } from "game/utils";
import { Creep, GameObject, StructureSpawn, _Constructor } from "game/prototypes";
import { ResourceConstant, RESOURCE_ENERGY } from "game/constants";

export interface OwnedGameObject extends GameObject {
	my: boolean | undefined;
}

export class Team {
	my: boolean | undefined;
	public constructor(my: boolean | undefined = true) {
		this.my = my;
	}
	public GetAll<object_t extends OwnedGameObject>(prototype: _Constructor<object_t>): object_t[] {
		return getObjectsByPrototype(prototype).filter(object => object.my === this.my);
	}
	public GetFirst<object_t extends OwnedGameObject>(prototype: _Constructor<object_t>): object_t | undefined {
		return getObjectsByPrototype(prototype).find(object => object.my === this.my);
	}
	public LocalInventory(resource: ResourceConstant = RESOURCE_ENERGY): number {
		return this.GetAll(StructureSpawn)
			.map(spawn => spawn.store.getUsedCapacity(resource) ?? 0)
			.reduce((max, current) => Math.max(max, current));
	}
	public GlobalInventory(resource: ResourceConstant = RESOURCE_ENERGY): number {
		return this.GetAll(StructureSpawn)
			.map(spawn => spawn.store.getUsedCapacity(resource) ?? 0)
			.reduce((sum, current) => sum + current);
	}
	public FindRole(classifier: Classifier<Creep>, role: string, membership: number): Creep[] {
		return this.GetAll(Creep).filter(creep => classifier.classify(creep).test(role) >= membership);
	}
	public CanAfford(cost: number, resource: ResourceConstant = RESOURCE_ENERGY): boolean {
		return this.GlobalInventory(resource) >= cost;
	}
	public get Population(): number {
		return this.GetAll(Creep).length;
	}
}
