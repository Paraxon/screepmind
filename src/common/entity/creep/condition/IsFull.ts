import { ResourceConstant } from "game/constants";
import { Store } from "game/prototypes";
import { Condition } from "../../../decisions/Condition";


export class IsFull<object_t extends { store: Store; }> implements Condition<object_t> {
	private resource?: ResourceConstant;
	public constructor(resource?: ResourceConstant) {
		this.resource = resource;
	}
	public evaluate(actor: object_t): boolean {
		return actor.store.getFreeCapacity(this.resource) === 0;
	}
}
