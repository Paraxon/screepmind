/* eslint-disable max-classes-per-file */
import { CreepMind } from "arena_alpha_spawn_and_swamp/main";
import { match } from "assert";
import { getObjectsByPrototype } from "game";
import { ERR_INVALID_TARGET, ERR_NOT_FOUND, OK, ScreepsReturnCode } from "game/constants";
import { GameObject, StructureContainer, _Constructor } from "game/prototypes";
import { Action } from "./Action";
import { Move } from "./Intent";

export abstract class FlagAction<actor_t, return_t = void> implements Action<actor_t, return_t> {
	public abstract execute(actor: actor_t): return_t | undefined;
	public canDoBoth(other: Action<actor_t, return_t>): boolean {
		return true;
	}
	public isComplete(actor: actor_t): boolean {
		return this.complete;
	}
	protected complete = false;
}

export class TargetNearest<object_t extends GameObject> extends FlagAction<CreepMind, ScreepsReturnCode> {
	public predicate?: (object: object_t) => boolean;
	public prototype: _Constructor<object_t>;
	public constructor(prototype: _Constructor<object_t>, predicate?: (object: object_t) => boolean) {
		super();
		this.prototype = prototype;
		this.predicate = predicate;
	}
	public execute(actor: CreepMind): ScreepsReturnCode | undefined {
		this.complete = true;
		console.log(`Finding nearest ${this.prototype.name}...`);
		const objects = getObjectsByPrototype(this.prototype);
		const matches = this.predicate ? objects.filter(this.predicate) : objects;
		console.log(`Objects: ${objects.length}, Matches: ${matches.length}`);
		if (matches.length === 0) return ERR_NOT_FOUND;
		actor.target = actor.findClosestByRange(objects);
		return OK;
	}
	public canDoBoth(other: Action<CreepMind, ScreepsReturnCode>): boolean {
		return true;
	}
	public isComplete(): boolean {
		return this.complete;
	}
}

/* export interface Condition<actor_t> {
	evaluate(actor: actor_t): boolean;
}

export class TargetNearest<entity_t extends GameObject> implements Condition<CreepMind> {
	private prototype!: _Constructor<entity_t>;
	private predicate?: (value: entity_t) => boolean;
	public evaluate(actor: CreepMind): boolean {
		const objects = getObjectsByPrototype(this.prototype);
		const matches = this.predicate ? objects.filter(this.predicate) : objects;
		if (matches.length === 0) return false;
		actor.target = actor.findClosestByRange(objects) ?? undefined;
		return true;
	}
} */

export class MoveToTarget extends Move {
	public isComplete(actor: CreepMind): boolean {
		if (actor.target) return actor.getRangeTo(actor.target) === 1;
		else return true;
	}
	public execute(actor: CreepMind): ScreepsReturnCode | undefined {
		if (actor.target) return actor.moveTo(actor.target);
		else return ERR_INVALID_TARGET;
	}
}
