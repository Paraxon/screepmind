import { Action } from "common/decisions/actions/Action";
import {
	ERR_NOT_FOUND, RESOURCE_ENERGY,
	ResourceConstant,
	ScreepsReturnCode
} from "game/constants";
import { Creep, StructureContainer, _Constructor } from "game/prototypes";
import { getObjectsByPrototype } from "game/utils";
import { Withdraw } from "../intent/Intent";


export class WithdrawResource<container_t extends StructureContainer> extends Withdraw {
	private resource: ResourceConstant;
	private prototype: _Constructor<container_t>;
	private flag = false;
	public constructor(prototype: _Constructor<container_t>, resource: ResourceConstant = RESOURCE_ENERGY) {
		super();
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
		const containers = getObjectsByPrototype(StructureContainer).filter(
			container => container.store[this.resource] > 0
		);
		const targets = actor.findInRange(containers, 1).sort((a, b) => a.store[this.resource] - b.store[this.resource]);
		this.flag = true;

		return targets.length ? actor.withdraw(targets[0], this.resource) : ERR_NOT_FOUND;
	}
}
