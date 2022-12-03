import { Action } from "common/decisions/actions/Action";
import { Constructor, ScreepsReturnCode } from "common/Library";
import { ERR_NOT_FOUND, RESOURCE_ENERGY } from "game/constants";
import { Creep, ResourceType, StructureContainer } from "game/prototypes";
import { getObjectsByPrototype } from "game/utils";
import { Transfer } from "../intent/Intent";

export class DepositResource<container_t extends StructureContainer> extends Transfer {
	private resource: ResourceType;
	private prototype: Constructor<container_t>;
	private flag = false;
	public constructor(prototype: Constructor<container_t>, resource: ResourceType = RESOURCE_ENERGY) {
		super();
		this.prototype = prototype;
		this.resource = resource;
	}
	public decide(actor: Creep): Action<Creep, ScreepsReturnCode> {
		return new DepositResource(this.prototype, this.resource);
	}
	public isComplete(actor: Creep): boolean {
		if (!actor.store[this.resource]) return true;
		const containers = getObjectsByPrototype(this.prototype).filter(container => container.store.getFreeCapacity(this.resource));
		const nearby = actor.findInRange(containers, 1);
		if (!nearby.length) return true;
		return !nearby[0].store.getFreeCapacity(this.resource);
	}
	public execute(actor: Creep): ScreepsReturnCode | undefined {
		this.flag = true;
		const targets = getObjectsByPrototype(this.prototype).filter(container => container.store.getFreeCapacity(this.resource));
		const target = actor.findInRange(targets, 1)[0];
		return target ? actor.transfer(target, this.resource) : ERR_NOT_FOUND;
	}
}
