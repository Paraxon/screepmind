import { OwnedGameObject, Prototype } from "common/library";
import { RESOURCE_ENERGY } from "game/constants";
import { Creep, ResourceType, StructureSpawn } from "game/prototypes";
import { getObjectsByPrototype } from "game/utils";

export class Team {
	my?: boolean;
	public constructor(my: boolean | undefined) {
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
	/* public FindRole(role: Role, membership: number = 1): Creep[] {
		return this.Creeps.filter(creep => classifier.classify(creep).test(role) >= membership);
	} */
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
