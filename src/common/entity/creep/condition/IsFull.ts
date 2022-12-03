import { RESOURCE_ENERGY } from "game/constants";
import { ResourceType, Store } from "game/prototypes";
import { Condition } from "../../../decisions/Condition";


export class IsFull<object_t extends { store: Store; }> implements Condition<object_t> {
	private resource?: ResourceType;
	public constructor(resource: ResourceType = RESOURCE_ENERGY) {
		this.resource = resource;
	}
	public evaluate(actor: object_t): boolean {
		return actor.store.getFreeCapacity(this.resource) === 0;
	}
}
