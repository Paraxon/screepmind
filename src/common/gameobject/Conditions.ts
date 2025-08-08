import * as Func from "common/Functional";
import * as Intent from "common/gameobject/creep/CreepIntent";
import * as Lib from "common/library";
import * as Consts from "game/constants";
import * as Proto from "game/prototypes";
import * as Utils from "game/utils";

export function inRange(
	targets: (actor: Proto.GameObject) => Proto.GameObject[],
	radius: Lib.Distance
): Func.Predicate<Proto.GameObject> {
	return (actor: Proto.GameObject): boolean => targets(actor).some(target => actor.getRangeTo(target) <= radius);
}

export function inIntentRange(intent: Intent.Intent) {
	return (actor: Proto.Creep, target: Proto.GameObject) => Utils.getRange(actor, target) <= Intent.RANGE[intent]!;
}

export function exists(targets: (actor: Proto.GameObject) => Proto.GameObject[]): Func.Predicate<Proto.GameObject> {
	return (actor: Proto.GameObject): boolean => targets(actor).length > 0;
}

export function healthAbovePercent(percent: number): Func.Predicate<{ hits?: number; hitsMax?: number }> {
	return (actor: { hits?: number; hitsMax?: number }): boolean =>
		actor.hits === undefined || actor.hitsMax === undefined || actor.hits / actor.hitsMax > percent;
}

export function hasResource(amount: number): Func.Predicate<{ store: Proto.Store }> {
	return (actor: { store: Proto.Store }): boolean =>
		(actor.store.getUsedCapacity(Consts.RESOURCE_ENERGY) ?? 0) >= amount;
}

export function isFull(): Func.Predicate<{ store: Proto.Store }> {
	return (actor: { store: Proto.Store }): boolean => actor.store.getFreeCapacity(Consts.RESOURCE_ENERGY) === 0;
}
