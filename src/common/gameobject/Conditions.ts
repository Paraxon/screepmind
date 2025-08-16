import * as Func from "common/Functional";
import * as Intent from "common/gameobject/creep/CreepIntent";
import * as Lib from "common/library";
import * as Consts from "game/constants";
import * as Proto from "game/prototypes";
import * as Utils from "game/utils";
import * as Intents from "./creep/CreepIntent";
import * as Nav from "game/path-finder";
import { Selector, Targeter } from "./creep/action/BoundAction";

// Containers within this range from spawn are considered starting containers
const STARTING_CONTAINER_RANGE = 10;

//#region Generators
// Unary Predicates
export function isOnTeam(...teams: (boolean | undefined)[]): Func.Predicate<Lib.OwnedGameObject> {
	return (target: Lib.OwnedGameObject): boolean => teams.some(team => team === target.my);
}
export function isSameTeam(actor: Lib.OwnedGameObject): Func.Predicate<Lib.OwnedGameObject> {
	return (target: Lib.OwnedGameObject): boolean => actor.my === target.my;
}
export function hasPart(...parts: Proto.BodyPartType[]): Func.Predicate<Proto.Creep> {
	return (actor: Proto.Creep): boolean => actor.body.some(({ type }) => parts.includes(type));
}
export function resourceAbsolute(compare: Func.Compare<number>, value: number, type = Consts.RESOURCE_ENERGY) {
	return (object: Lib.Inventory): boolean => compare(object.store[type] ?? 0, value);
}
export function resourceRelative(compare: Func.Compare<number>, value: number, type = Consts.RESOURCE_ENERGY) {
	return (object: Lib.Inventory): boolean =>
		compare((object.store[type] ?? 0) / object.store.getCapacity(type)!, value);
}
export function hitsAbsolute(compare: Func.Compare<number>, value: number) {
	return (object: Lib.Health): boolean => compare(object.hits!, value);
}
export function hitsRelative(compare: Func.Compare<number>, percent: number) {
	return (actor: Proto.Creep): boolean => compare(actor.hits / actor.hitsMax, percent);
}

export function anyFound(targets: (actor: Proto.GameObject) => Proto.GameObject[]): Func.Predicate<Proto.GameObject> {
	return (actor: Proto.GameObject): boolean => targets(actor).length > 0;
}
export function anyInRange(targets: (actor: Proto.GameObject) => Proto.GameObject[], range: Lib.Range) {
	return (actor: Proto.GameObject): boolean => targets(actor).some(target => actor.getRangeTo(target) <= range);
}
export function anyInRangeFor(targets: (actor: Proto.GameObject) => Proto.GameObject[], intent: Intent.Intent) {
	return anyInRange(targets, Intent.RANGE[intent]!);
}
export function targetRangeAbsolute(compare: Func.Compare<Lib.Range>, range: Lib.Range) {
	return (actor: Proto.GameObject, target: Proto.Position) => compare(actor.getRangeTo(target), range);
}
export function inRangeFor(intent: Intent.Intent) {
	return targetRangeAbsolute(Func.less_equal, Intent.RANGE[intent]!);
}
//#endregion

export function resourceCompare<actor_t extends Lib.Inventory, target_t extends Lib.Inventory>(
	compare: Func.Compare<number>,
	type = Consts.RESOURCE_ENERGY
) {
	return (actor: actor_t, target: target_t): boolean => compare(actor.store[type] ?? 0, target.store[type] ?? 0);
}

//#region Predicates
// Unary Predicates, Ownership
export const isPlayer = isOnTeam(true);
export const isOpponent = isOnTeam(false);
export const isNeutral = isOnTeam(undefined);

// Predicates, Navigation
export const accessibleFromSpawn = (actor: Proto.GameObject, target: Proto.Position): boolean => {
	const spawn = playerSpawns(actor)[0]!;
	const end = Utils.findPath(spawn, target, { ignore: [actor] }).at(-1);
	return end?.x === target.x && end?.y === target.y;
};

// Predicates, Parts
export const isArmed = hasPart(Consts.ATTACK, Consts.RANGED_ATTACK);
export const isUnarmed = Func.not(isArmed);
export const isThreat = Func.and(isOpponent, isArmed);
export const isNotThreat = Func.not(isThreat);
export const isEnemyVillager = Func.and(isOpponent, Func.not(isArmed));

// Predicates, Resource
export const isEmpty = resourceAbsolute(Func.less_equal, 0);
export const hasEnergy = resourceAbsolute(Func.greater, 0);
export const isFullEnergy = resourceRelative(Func.greater_equal, 1);

// Predicates, Health
export const isHurt = hitsRelative(Func.less, 1);
export const isUnhurt = hitsRelative(Func.greater_equal, 1);
export const isDead = hitsAbsolute(Func.less_equal, 0);

// Predicates, Range
export const canTouch = targetRangeAbsolute(Func.less_equal, 1);
export const inWithdrawRange = inRangeFor(Intents.Intent.WITHDRAW);
export const inBuildRange = inRangeFor(Intents.Intent.BUILD);
export const inAttackRange = inRangeFor(Intents.Intent.ATTACK);
export const inRangedAttackRange = inRangeFor(Intents.Intent.RANGED_ATTACK);
export const inHealRange = inRangeFor(Intents.Intent.HEAL);
export const inRangedHealRange = inRangeFor(Intents.Intent.RANGED_HEAL);
//#endregion

//#region Targeters
// Targeters, Player Creeps
export const playerCreeps = () => Utils.getObjectsByPrototype(Proto.Creep).filter(isPlayer);
export const armedFriendlies = () => playerCreeps().filter(isArmed);
export const hurtAllies = () => playerCreeps().filter(isHurt);

// Targeters, OpponentCreeps
export const enemyCreeps = () => Utils.getObjectsByPrototype(Proto.Creep).filter(isOpponent);
export const enemyVillagers = () => enemyCreeps().filter(isUnarmed);
export const enemyArmed = () => enemyCreeps().filter(isArmed);
export const enemyMelee = () => enemyCreeps().filter(hasPart(Consts.ATTACK));
export const enemyRanged = () => enemyCreeps().filter(hasPart(Consts.RANGED_ATTACK));

// Targeters, Structures
export const playerSites: Targeter<Proto.GameObject, Proto.ConstructionSite> = _actor =>
	Utils.getObjectsByPrototype(Proto.ConstructionSite).filter(isPlayer);
export const playerSpawns: Targeter<Proto.GameObject, Proto.StructureSpawn> = _actor =>
	Utils.getObjectsByPrototype(Proto.StructureSpawn).filter(isPlayer);
export const opponentSpawns: Targeter<Proto.GameObject, Proto.StructureSpawn> = _actor =>
	Utils.getObjectsByPrototype(Proto.StructureSpawn).filter(isOpponent);
export const playerStartingContainers: Targeter<Proto.GameObject, Proto.StructureContainer> = actor => {
	const spawn = playerSpawns(actor)[0]!;
	return Utils.getObjectsByPrototype(Proto.StructureContainer)
		.filter(isNeutral)
		.filter(hasEnergy)
		.filter(container => spawn.getRangeTo(container) <= STARTING_CONTAINER_RANGE);
};
export const playerStartingObstacles: Targeter<Proto.GameObject, Proto.StructureWall> = actor => {
	const spawn = playerSpawns(actor)[0]!;
	const walls = Utils.getObjectsByPrototype(Proto.StructureWall).filter(
		wall => wall.getRangeTo(spawn) < STARTING_CONTAINER_RANGE
	);
	// Do not use getTerrainAt(pos) to check for walls constructed before the start of the game
	return playerStartingContainers(actor)
		.map(container => Nav.searchPath(spawn, container).path)
		.flatMap(path => path.map(pos => walls.find(wall => wall.x == pos.x && wall.y == pos.y)))
		.filter(match => match !== undefined)
		.map(match => match as Proto.StructureWall);
};
export const playerAccessibleStartingContainers = (actor: Proto.GameObject) =>
	playerStartingContainers(actor).filter(container => accessibleFromSpawn(actor, container));

//#endregion

// Predicates, Multi
export const allyExists = anyFound(armedFriendlies);
export const enemyHasThreats = anyFound(enemyArmed);
export const anyAlliesInjured = anyFound(hurtAllies);
export const enemyHasCreeps = anyFound(() => Utils.getObjectsByPrototype(Proto.Creep).filter(isOpponent));
export const canTouchInjured = anyInRangeFor(hurtAllies, Intents.Intent.HEAL);
export const canReachInjured = anyInRangeFor(hurtAllies, Intents.Intent.RANGED_HEAL);
export const canTouchSpawn = anyInRangeFor(playerSpawns, Intents.Intent.TRANSFER);
export const threatInShootingRange = anyInRange(
	() => Utils.getObjectsByPrototype(Proto.Creep).filter(isOpponent),
	Intents.RANGE[Intents.Intent.RANGED_ATTACK]!
);

// #region Reducers
// export const leastHealthCreep = (lowest: Proto.Creep | undefined, current: Proto.Creep) =>
// 	!lowest || current.hits! < lowest.hits! ? current : lowest;
export const leastHealthSpawn = (lowest: Proto.StructureSpawn, current: Proto.StructureSpawn) =>
	current.hits! < lowest.hits! ? current : lowest;
// export const mostEnergy = (most: Proto.StructureContainer | undefined, current: Proto.StructureContainer) =>
// 	!most || current.store[Consts.RESOURCE_ENERGY] > most.store[Consts.RESOURCE_ENERGY] ? current : most;
export function closestTo<target_t extends Proto.Position>(
	actor: Proto.GameObject
): (closest: target_t | undefined, current: target_t) => target_t {
	return (closest: target_t | undefined, current: target_t) =>
		!closest || Utils.getRange(actor, current) < Utils.getRange(actor, closest) ? current : closest;
}
// export const mostComplete = (closest: Proto.ConstructionSite | undefined, current: Proto.ConstructionSite) =>
// 	!closest || current.progressTotal! - current.progress! < closest.progressTotal! - closest.progress!
// 		? current
// 		: closest;
// #endregion

// #region Selectors
export function selectProperty<target_t, key_t extends keyof target_t, value_t extends target_t[key_t]>(
	key: key_t,
	compare: Func.Compare<value_t>
): Selector<Proto.GameObject, target_t> {
	return (_actor: Proto.GameObject, targets: target_t[]) => {
		return targets.length
			? targets.reduce((acc, curr) => {
					return compare(curr[key] as value_t, acc[key] as value_t) ? curr : acc;
			  })
			: undefined;
	};
}
export const leastHealth = selectProperty<Lib.Health, "hits", number>("hits", Func.less);
// export function leastHealth<actor_t, target_t extends Proto.Creep | Proto.Structure>(
// 	_actor: actor_t,
// 	targets: target_t[]
// ): target_t | undefined {
// 	return targets.length > 0
// 		? targets.reduce((lowest, current) => (current.hits! < lowest.hits! ? current : lowest))
// 		: undefined;
// }
export function closest<actor_t extends Proto.GameObject, target_t extends Proto.Position>(
	actor: actor_t,
	targets: target_t[]
): target_t | undefined {
	return targets.length > 0
		? targets.reduce((closest, current) => (actor.getRangeTo(current) < actor.getRangeTo(closest) ? current : closest))
		: undefined;
}
export function mostEnergy<actor_t extends Lib.Inventory, target_t extends Lib.Inventory>(
	_actor: actor_t,
	targets: target_t[]
): target_t | undefined {
	return targets.length > 0
		? targets.reduce((most, current) =>
				(current.store[Consts.RESOURCE_ENERGY] ?? 0) > (most.store[Consts.RESOURCE_ENERGY] ?? 0) ? current : most
		  )
		: undefined;
}
export function mostComplete<actor_t extends Proto.GameObject, target_t extends Proto.ConstructionSite>(
	_actor: actor_t,
	targets: target_t[]
): target_t | undefined {
	return targets.length > 0
		? targets.reduce((most, current) =>
				current.progressTotal! - current.progress! > most.progressTotal! - most.progress! ? current : most
		  )
		: undefined;
}
//#endregion
