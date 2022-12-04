import { Action } from "common/decisions/actions/Action";
import { CreepMind } from "common/entity/creep/CreepMind";
import { ID, ScreepsReturnCode } from "common/Library";
import { ERR_INVALID_TARGET, MOVE } from "game/constants";
import { Creep, GameObject } from "game/prototypes";
import { getObjectById } from "game/utils";
import { CreepAction } from "./CreepAction";

/* export class TargetNearest<object_t extends GameObject> extends FlagAction<CreepMind, ScreepsReturnCode> {
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
} */

export class MoveToObject extends CreepAction {
	private targetID: ID;
	public constructor(id: ID) {
		super(MOVE);
		this.targetID = id;
	}
	public decide(actor: Creep): Action<Creep, ScreepsReturnCode> {
		return new MoveToObject(this.targetID);
	}
	public isComplete(actor: Creep): boolean {
		const target = getObjectById(this.targetID as string);
		Object.assign(actor, { target: this.targetID });
		return target ? actor.getRangeTo(target) <= 1 : true;
	}
	public execute(actor: CreepMind): ScreepsReturnCode | undefined {
		const target = getObjectById(this.targetID as string);
		const options = { swampCost: 2 }; // Ignore swamp
		return target ? actor.moveTo(target, options) : ERR_INVALID_TARGET;
	}
}
