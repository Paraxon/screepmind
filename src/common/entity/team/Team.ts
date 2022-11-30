import { Classifier } from "common/classification/Classifier";
import { Role } from "common/classification/Role";
import { getObjectsByPrototype } from "game/utils";
import { Creep, StructureSpawn, _Constructor } from "game/prototypes";
import { ResourceConstant, RESOURCE_ENERGY } from "game/constants";

export interface OwnedGameObject {
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
	public get Creeps(): Creep[] {
		return this.GetAll(Creep);
	}
	public Inventory(resource: ResourceConstant = RESOURCE_ENERGY): number {
		return getObjectsByPrototype(StructureSpawn)
			.filter(object => object.my === this.my)
			.map(spawn => spawn.store.getUsedCapacity(resource) ?? 0)
			.sort()[1];
	}
	public FindCreeps(classifier: Classifier<Creep, Role>, role: Role, membership: number): Creep[] {
		return this.Creeps.filter(creep => classifier.classify(creep).test(role) >= membership);
	}
	public CanAfford(cost: number, resource: ResourceConstant = RESOURCE_ENERGY): boolean {
		return this.Inventory(resource) >= cost;
	}
}
