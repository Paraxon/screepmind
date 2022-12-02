/* eslint-disable max-classes-per-file */
import { ResourceConstant } from "game/constants";
import { Creep, GameObject, Id, Store, _Constructor } from "game/prototypes";
import { getObjectById, getObjectsByPrototype } from "game/utils";
import { Condition } from "../../decisions/Condition";

export class InRangeOf<object_t extends GameObject> implements Condition<GameObject> {
	private range: number;
	private prototype: _Constructor<object_t>;
	private predicate?: (object: object_t) => boolean;
	public constructor(prototype: _Constructor<object_t>, range = 1, predicate?: (object: object_t) => boolean) {
		this.prototype = prototype;
		this.range = range;
		this.predicate = predicate;
	}
	public evaluate(actor: Creep): boolean {
		const objects = getObjectsByPrototype(this.prototype);
		const matches = this.predicate ? objects.filter(this.predicate) : objects;
		return actor.findInRange(matches, this.range).length !== 0;
	}
}

export class AdjacentTo implements Condition<GameObject> {
	private id: Id<GameObject>;
	public constructor(id: Id<GameObject>) {
		this.id = id;
	}
	evaluate(actor: GameObject): boolean {
		const target = getObjectById(this.id);
		return target ? actor.getRangeTo(target) === 1 : true;
	}

}

export class Empty<object_t extends { store: Store<ResourceConstant> }> implements Condition<object_t> {
	private resource?: ResourceConstant;
	public constructor(resource?: ResourceConstant) {
		this.resource = resource;
	}
	public evaluate(actor: object_t): boolean {
		return actor.store.getUsedCapacity(this.resource) === 0;
	}
}

export class IsFull<object_t extends { store: Store<ResourceConstant> }> implements Condition<object_t> {
	private resource?: ResourceConstant;
	public constructor(resource?: ResourceConstant) {
		this.resource = resource;
	}
	public evaluate(actor: object_t): boolean {
		return actor.store.getFreeCapacity(this.resource) === 0;
	}
}

export class IsEmpty<object_t extends { store: Store<ResourceConstant> }> implements Condition<object_t> {
	private resource?: ResourceConstant;
	public constructor(resource?: ResourceConstant) {
		this.resource = resource;
	}
	public evaluate(actor: object_t): boolean {
		return actor.store.getUsedCapacity(this.resource) === 0;
	}
}
