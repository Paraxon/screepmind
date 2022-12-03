import { ResourceType, Store } from "game/prototypes";
import { Condition } from "../../../decisions/Condition";

export class IsEmpty<object_t extends { store: Store; }> implements Condition<object_t> {
	private resource?: ResourceType;
	public constructor(resource?: ResourceType) {
		this.resource = resource;
	}
	public evaluate(actor: object_t): boolean {
		return actor.store.getUsedCapacity(this.resource) === 0;
	}
}
