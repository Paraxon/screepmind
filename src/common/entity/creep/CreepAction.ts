/* eslint-disable max-classes-per-file */
import { CreepMind } from "common/entity/creep/CreepMind";
import { BUILD_RANGE } from "common/Library";
import { getObjectsByPrototype } from "game";
import {
	ERR_INVALID_TARGET,
	ERR_NOT_FOUND,
	OK,
	RESOURCE_ENERGY,
	ResourceConstant,
	ScreepsReturnCode
} from "game/constants";
import { ConstructionSite, Creep, GameObject, Resource, RoomPosition, Source, Store, StructureContainer, StructureSpawn, _Constructor } from "game/prototypes";
import { Action, FlagAction } from "../decisions/actions/Action";
import { Build, Harvest, Move, MoveTo, Pickup, Transfer, Withdraw } from "./Intent";

export class TargetNearest<object_t extends GameObject> extends FlagAction<CreepMind, ScreepsReturnCode> {
	public decide(actor: CreepMind): Action<CreepMind, ScreepsReturnCode> {
		return new TargetNearest(this.prototype, this.predicate);
	}
	public predicate?: (object: object_t) => boolean;
	public prototype: _Constructor<object_t>;
	public constructor(prototype: _Constructor<object_t>, predicate?: (object: object_t) => boolean) {
		super();
		this.prototype = prototype;
		this.predicate = predicate;
	}
	public execute(actor: CreepMind): ScreepsReturnCode | undefined {
		this.complete = true;
		const objects = getObjectsByPrototype(this.prototype);
		const matches = this.predicate ? objects.filter(this.predicate) : objects;
		if (matches.length === 0) return ERR_NOT_FOUND;
		actor.target = actor.findClosestByRange(objects) || undefined;
		return OK;
	}
	public canDoBoth(other: Action<CreepMind, ScreepsReturnCode>): boolean {
		return true;
	}
	public isComplete(): boolean {
		return this.complete;
	}
}

export class MoveToTarget extends Move {
	public decide(actor: Creep): Action<Creep, ScreepsReturnCode> {
		return new MoveToTarget();
	}
	public isComplete(actor: CreepMind): boolean {
		if (actor.target) return actor.getRangeTo(actor.target) === 1;
		else return true;
	}
	public execute(actor: CreepMind): ScreepsReturnCode | undefined {
		if (actor.target) return actor.moveTo(actor.target);
		else return ERR_INVALID_TARGET;
	}
}

export class MoveToNearest<object_t extends GameObject> extends MoveTo {
	private predicate?: (object: object_t) => boolean;
	private prototype: _Constructor<object_t>;
	private range: number;
	private target?: object_t;

	public constructor(prototype: _Constructor<object_t>, range = 1, predicate?: (object: object_t) => boolean) {
		super();
		this.range = range;
		this.prototype = prototype;
		this.predicate = predicate;
	}
	public isComplete(actor: Creep): boolean {
		return this.target ? actor.getRangeTo(this.target) <= this.range : false;
	}
	public decide(actor: Creep): Action<Creep, ScreepsReturnCode> {
		return new MoveToNearest(this.prototype, this.range, this.predicate);
	}
	public execute(actor: Creep): ScreepsReturnCode | undefined {
		if (!this.target) {
			const targets = getObjectsByPrototype(this.prototype);
			const matches = this.predicate ? targets.filter(this.predicate) : targets;
			this.target = actor.findClosestByRange(matches) ?? undefined;
		}
		return this.target ? actor.moveTo(this.target) : ERR_INVALID_TARGET;
	}
}

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

export class DepositResource<container_t extends StructureContainer> extends Transfer {
	private resource: ResourceConstant;
	private prototype: _Constructor<container_t>;
	private flag = false;
	public constructor(prototype: _Constructor<container_t>, resource: ResourceConstant = RESOURCE_ENERGY) {
		super();
		this.prototype = prototype;
		this.resource = resource;
	}
	public decide(actor: Creep): Action<Creep, ScreepsReturnCode> {
		return new DepositResource(this.prototype, this.resource);
	}
	public isComplete(actor: Creep): boolean {
		return this.flag;
	}
	public execute(actor: Creep): ScreepsReturnCode | undefined {
		this.flag = true;
		const targets = getObjectsByPrototype(this.prototype).filter(container => container.store.getFreeCapacity(this.resource));
		const target = actor.findInRange(targets, 1)[0];
		return target ? actor.transfer(target, this.resource) : ERR_NOT_FOUND;
	}
}

export class HarvestResource extends Harvest {
	private target?: Source;
	public decide(actor: Creep): Action<Creep, ScreepsReturnCode> {
		return new HarvestResource();
	}
	public isComplete(actor: Creep): boolean {
		return actor.store.getFreeCapacity() === 0;
	}
	public execute(actor: Creep): ScreepsReturnCode | undefined {
		if (!this.target) {
			const targets = getObjectsByPrototype(Source);
			this.target = actor.findInRange(targets, 1)[0];
		}
		return this.target ? actor.harvest(this.target) : ERR_NOT_FOUND;
	}
}

export class BuildAtSite extends Build {
	private target?: ConstructionSite;
	public decide(actor: Creep): Action<Creep, ScreepsReturnCode> {
		return new BuildAtSite();
	}
	public isComplete(actor: Creep): boolean {
		return this.target !== undefined && this.target!.progress === this.target!.progressTotal;
	}
	public execute(actor: Creep): ScreepsReturnCode | undefined {
		if (!this.target) {
			const targets = getObjectsByPrototype(ConstructionSite);
			this.target = actor.findInRange(targets, BUILD_RANGE)[0];
		}
		return this.target ? actor.build(this.target) : ERR_NOT_FOUND;
	}
}
