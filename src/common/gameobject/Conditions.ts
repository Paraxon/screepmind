import * as Func from "common/Functional";
import * as Intent from "common/gameobject/creep/CreepIntent";
import * as Lib from "common/library";
import * as Consts from "game/constants";
import * as Proto from "game/prototypes";
import * as Utils from "game/utils";
import * as Intents from "./creep/CreepIntent";
import * as Nav from "game/path-finder";

// Predicate Generators
export function anyFound(targets: (actor: Proto.GameObject) => Proto.GameObject[]): Func.Predicate<Proto.GameObject> {
	return (actor: Proto.GameObject): boolean => targets(actor).length > 0;
}
export function anyInRange(targets: (actor: Proto.GameObject) => Proto.GameObject[], range: Lib.Range) {
	return (actor: Proto.GameObject): boolean => targets(actor).some(target => actor.getRangeTo(target) <= range);
}
export function anyInRangeFor(targets: (actor: Proto.GameObject) => Proto.GameObject[], intent: Intent.Intent) {
	return anyInRange(targets, Intent.RANGE[intent]!);
}
export function rangeAbsolute(compare: Func.Compare<Lib.Range>, range: Lib.Range) {
	return (actor: Proto.GameObject, target: Proto.Position) => compare(actor.getRangeTo(target), range);
}
export function inRangeFor(intent: Intent.Intent) {
	return rangeAbsolute(Func.less_equal, Intent.RANGE[intent]!);
}
export function isSameTeam(actor: Lib.OwnedGameObject): Func.Predicate<Lib.OwnedGameObject> {
	return (target: Lib.OwnedGameObject): boolean => actor.my === target.my;
}
export function isOnTeam(...teams: (boolean | undefined)[]): Func.Predicate<Lib.OwnedGameObject> {
	return (target: Lib.OwnedGameObject): boolean => teams.includes(target.my);
}
export function hasPart(...parts: Proto.BodyPartType[]) {
	return (actor: Proto.Creep): boolean => actor.body.some(({ type, hits }) => type in parts);
}
export function resourceAbsolute(compare: Func.Compare<number>, value: number, type = Consts.RESOURCE_ENERGY) {
	return (object: Lib.Inventory): boolean => compare(object.store[type], value);
}
export function resourceRelative(compare: Func.Compare<number>, value: number, type = Consts.RESOURCE_ENERGY) {
	return (object: Lib.Inventory): boolean => compare(object.store[type] / object.store.getCapacity(type)!, value);
}
export function resourceCompare<actor_t extends Lib.Inventory, target_t extends Lib.Inventory>(
	compare: Func.Compare<number>,
	type = Consts.RESOURCE_ENERGY
) {
	return (actor: actor_t, target: target_t): boolean => compare(actor.store[type], target.store[type]);
}
export function hitsAbsolute(compare: Func.Compare<number>, value: number) {
	return (object: Lib.Health): boolean => compare(object.hits, value);
}
export function hitsRelative(compare: Func.Compare<number>, percent: number) {
	return (actor: Proto.Creep): boolean => compare(actor.hits / actor.hitsMax, percent);
}

// Predicates, Ownership
export const isPlayer = isOnTeam(true);
export const isOpponent = isOnTeam(false);
export const isNeutral = isOnTeam(undefined);

// Predicates, Parts
export const isArmed = hasPart(Consts.ATTACK, Consts.RANGED_ATTACK);
export const isThreat = Func.and(isOpponent, isArmed);
export const isNotThreat = Func.not(isThreat);
export const isEnemyVillager = Func.and(isOpponent, Func.not(isArmed));

// Predicates, Resource
export const isEmpty = resourceAbsolute(Func.less_equal, 0);
export const hasEnergy = resourceAbsolute(Func.greater, 0);
export const isFullEnergy = resourceRelative(Func.greater_equal, 1);

// Predicates, Health
export const isHurt = hitsRelative(Func.less, 1);
export const isNotHurt = hitsRelative(Func.greater_equal, 1);
export const isDead = hitsAbsolute(Func.less_equal, 0);
export const anyAlliesInjured = anyFound((_actor: Proto.GameObject) =>
	Utils.getObjectsByPrototype(Proto.Creep)
		.filter(isPlayer)
		.filter(creep => creep.hits < creep.hitsMax)
);

// Predicates, Range
export const canTouch = rangeAbsolute(Func.less_equal, 1);
export const inWithdrawRange = inRangeFor(Intents.Intent.WITHDRAW);
export const inBuildRange = inRangeFor(Intents.Intent.BUILD);
export const inAttackRange = inRangeFor(Intents.Intent.ATTACK);
export const inRangedAttackRange = inRangeFor(Intents.Intent.RANGED_ATTACK);
export const inHealRange = inRangeFor(Intents.Intent.HEAL);
export const inRangedHealRange = inRangeFor(Intents.Intent.RANGED_HEAL);

// Targeters, Multi
export const enemyVillagers = () => Utils.getObjectsByPrototype(Proto.Creep).filter(isEnemyVillager);
export const enemySpawns = () => Utils.getObjectsByPrototype(Proto.StructureSpawn).filter(isOpponent);
export const friendlySpawns = () => Utils.getObjectsByPrototype(Proto.StructureSpawn).filter(isPlayer);
export const threats = () => Utils.getObjectsByPrototype(Proto.Creep).filter(isThreat);
export const enemyCreeps = () => Utils.getObjectsByPrototype(Proto.Creep).filter(isOpponent);
export const neutralEnergySource = () =>
	Utils.getObjectsByPrototype(Proto.StructureContainer).filter(isNeutral).filter(hasEnergy);
export const friendlySites = () => Utils.getObjectsByPrototype(Proto.ConstructionSite).filter(isPlayer);
export const injuredFriendlies = () => Utils.getObjectsByPrototype(Proto.Creep).filter(isPlayer).filter(isHurt);
export const armedFriendlies = () => Utils.getObjectsByPrototype(Proto.Creep).filter(isPlayer).filter(isArmed);

// Predicates, Multi
export const canTouchInjured = anyInRangeFor(injuredFriendlies, Intents.Intent.HEAL);
export const canReachInjured = anyInRangeFor(injuredFriendlies, Intents.Intent.RANGED_HEAL);
export const allyExists = anyFound(armedFriendlies);
export const enemyHasThreats = anyFound(threats);

// Targeters
export function getClosestObstacle(actor: Proto.Creep): Proto.StructureWall | undefined {
	const searchRadius = 10;
	const spawn = Utils.getObjectsByPrototype(Proto.StructureSpawn).find(isPlayer)!;
	const walls = Utils.getObjectsByPrototype(Proto.StructureWall).filter(wall => wall.getRangeTo(spawn) < searchRadius);
	// Do not use getTerrainAt(pos) to check for walls constructed before the start of the game
	return Utils.getObjectsByPrototype(Proto.StructureContainer)
		.filter(container => container.getRangeTo(spawn) < searchRadius)
		.map(container => Nav.searchPath(spawn, container).path)
		.flatMap(path => path.map(pos => walls.find(wall => wall.x == pos.x && wall.y == pos.y)))
		.filter(match => match != undefined)
		.reduce(
			(prev, current) => (!prev || actor.getRangeTo(current!) < actor.getRangeTo(prev) ? current! : prev),
			undefined as Proto.StructureWall | undefined
		);
}

// Reducers
export const leastHealthCreep = (lowest: Proto.Creep | undefined, current: Proto.Creep) =>
	!lowest || current.hits! < lowest.hits! ? current : lowest;
export const leastHealthSpawn = (lowest: Proto.StructureSpawn, current: Proto.StructureSpawn) =>
	current.hits! < lowest.hits! ? current : lowest;
export const mostEnergy = (most: Proto.StructureContainer | undefined, current: Proto.StructureContainer) =>
	!most || current.store[Consts.RESOURCE_ENERGY] > most.store[Consts.RESOURCE_ENERGY] ? current : most;
export function closestTo<target_t extends Proto.Position>(
	actor: Proto.GameObject
): (closest: target_t | undefined, current: target_t) => target_t {
	return (closest: target_t | undefined, current: target_t) =>
		!closest || Utils.getRange(actor, current) < Utils.getRange(actor, closest) ? current : closest;
}
export const mostComplete = (closest: Proto.ConstructionSite | undefined, current: Proto.ConstructionSite) =>
	!closest || current.progressTotal! - current.progress! < closest.progressTotal! - closest.progress!
		? current
		: closest;
export const enemyHasCreeps = anyFound(() => Utils.getObjectsByPrototype(Proto.Creep).filter(isOpponent));
export const threatInShootingRange = anyInRange(
	() => Utils.getObjectsByPrototype(Proto.Creep).filter(isOpponent),
	Intents.RANGE[Intents.Intent.RANGED_ATTACK]!
);
