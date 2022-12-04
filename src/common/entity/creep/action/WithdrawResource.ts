import { Action } from "common/decisions/actions/Action";
import { INTENT_RANGE, Prototype, ScreepsReturnCode, WITHDRAW } from "common/Library";
import { RESOURCE_ENERGY, ERR_NOT_FOUND } from "game/constants";
import { Creep, ResourceType, StructureContainer } from "game/prototypes";
import { getObjectsByPrototype } from "game/utils";
import { CreepAction } from "./CreepAction";

export class WithdrawResource<container_t extends StructureContainer> extends CreepAction {
	private resource: ResourceType;
	private prototype: Prototype<container_t>;
	private flag = false;
	public constructor(prototype: Prototype<container_t>, resource: ResourceType = RESOURCE_ENERGY) {
		super(WITHDRAW);
		this.prototype = prototype;
		this.resource = resource;
	}
	public decide(actor: Creep): Action<Creep, ScreepsReturnCode> {
		return new WithdrawResource(this.prototype, this.resource);
	}
	public isComplete(actor: Creep): boolean {
		return this.flag;
	}
	public execute(actor: Creep): ScreepsReturnCode | undefined {
		this.flag = true;
		const containers = getObjectsByPrototype(StructureContainer).filter(container => container.store[this.resource] > 0);
		const container = actor
			.findInRange(containers, INTENT_RANGE[WITHDRAW]!).
			reduce((best, current) => best.store[this.resource] > current.store[this.resource] ? best : current);
		return actor.withdraw(container, this.resource);
	}
}
