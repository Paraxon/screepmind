import { Action } from "common/decisions/actions/Action";
import { CreepMind } from "common/entity/creep/CreepMind";
import { ERR_INVALID_TARGET, ScreepsReturnCode } from "game/constants";
import { Creep, GameObject, Id } from "game/prototypes";
import { getObjectById } from "game/utils";
import { Move } from "../intent/Intent";

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

export class MoveToObject extends Move {
	private targetID: Id<GameObject>;
	public constructor(id: Id<GameObject>) {
		super();
		this.targetID = id;
	}
	public decide(actor: Creep): Action<Creep, ScreepsReturnCode> {
		return new MoveToObject(this.targetID);
	}
	public isComplete(actor: Creep): boolean {
		const target = getObjectById(this.targetID);
		Object.assign(actor, { target: this.targetID });
		return target ? actor.getRangeTo(target) === 1 : true;
	}
	public execute(actor: CreepMind): ScreepsReturnCode | undefined {
		const target = getObjectById(this.targetID);
		const options = { swampCost: 2 }; // Ignore swamp
		return target ? actor.moveTo(target, options) : ERR_INVALID_TARGET;
	}
}
