import { Action } from "common/decisions/actions/Action";
import { INTENT_RANGE, TRANSFER } from "common/gameobject/creep/CreepIntent";
import { Prototype } from "common/Library";
import { ERR_NOT_FOUND, RESOURCE_ENERGY } from "game/constants";
import { Creep, ResourceType, StructureContainer } from "game/prototypes";
import { getObjectsByPrototype } from "game/utils";
import { ScreepsReturnCode } from "../../ReturnCode";
import { CreepAction } from "./CreepAction";

export class DepositResource<container_t extends StructureContainer> extends CreepAction {
	private readonly resource: ResourceType;
	private readonly prototype: Prototype<container_t>;
	public constructor(prototype: Prototype<container_t>, resource: ResourceType = RESOURCE_ENERGY) {
		super(TRANSFER);
		this.prototype = prototype;
		this.resource = resource;
	}
	public decide(actor: Creep): Action<Creep, ScreepsReturnCode> {
		return new DepositResource(this.prototype, this.resource);
	}
	public isComplete(actor: Creep): boolean {
		return !actor.store[this.resource] || !this.getTargets(actor).length;
	}
	public execute(actor: Creep): ScreepsReturnCode | undefined {
		this.emote(actor);
		const targets = this.getTargets(actor);
		return this.getTargets.length ? actor.transfer(targets[0], this.resource) : ERR_NOT_FOUND;
	}
	public getTargets(actor: Creep): container_t[] {
		return actor.findInRange(getObjectsByPrototype(this.prototype)
			.filter(container => container.store.getFreeCapacity(this.resource)),
			INTENT_RANGE[TRANSFER]!);
	}
}
