import { Action } from "common/decisions/actions/Action";
import { Prototype, ScreepsReturnCode } from "common/Library";
import { INTENT_RANGE, WITHDRAW } from "common/entity/creep/CreepIntent";
import { RESOURCE_ENERGY, ERR_NOT_FOUND } from "game/constants";
import { Creep, ResourceType, StructureContainer } from "game/prototypes";
import { getObjectsByPrototype } from "game/utils";
import { CreepAction } from "./CreepAction";

export class WithdrawResource<container_t extends StructureContainer> extends CreepAction {
	private readonly resource: ResourceType;
	private readonly prototype: Prototype<container_t>;
	public constructor(prototype: Prototype<container_t>, resource: ResourceType = RESOURCE_ENERGY) {
		super(WITHDRAW);
		this.prototype = prototype;
		this.resource = resource;
	}
	public decide(actor: Creep): Action<Creep, ScreepsReturnCode> {
		return new WithdrawResource(this.prototype, this.resource);
	}
	public isComplete(actor: Creep): boolean {
		return !actor.store.getFreeCapacity(this.resource);
	}
	public execute(actor: Creep): ScreepsReturnCode | undefined {
		const containers = this.getTargets(actor);
		if (!containers.length) return ERR_NOT_FOUND;
		const fullest = containers.reduce((fullest, current) =>
			fullest.store[this.resource] > current.store[this.resource] ? fullest : current);
		return actor.withdraw(fullest, this.resource);
	}
	private getTargets(actor: Creep): container_t[] {
		return actor.findInRange(
			getObjectsByPrototype(this.prototype).filter(container => container.store[this.resource]),
			INTENT_RANGE[WITHDRAW]!);
	}
}
