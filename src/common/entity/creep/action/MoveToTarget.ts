import { Action } from "common/decisions/actions/Action";
import { CreepMind } from "common/entity/creep/CreepMind";
import { ERR_INVALID_TARGET, ScreepsReturnCode } from "game/constants";
import { Creep } from "game/prototypes";
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

export class MoveToTarget extends Move {
	public decide(actor: Creep): Action<Creep, ScreepsReturnCode> {
		return new MoveToTarget();
	}
	public isComplete(actor: CreepMind): boolean {
		if (actor.target)
			return actor.getRangeTo(actor.target) === 1;
		else
			return true;
	}
	public execute(actor: CreepMind): ScreepsReturnCode | undefined {
		if (actor.target)
			return actor.moveTo(actor.target);
		else
			return ERR_INVALID_TARGET;
	}
}
