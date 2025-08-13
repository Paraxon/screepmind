import * as Func from "common/Functional";
import * as Intent from "common/gameobject/creep/CreepIntent";
import * as Lib from "common/library";
import * as Consts from "game/constants";
import * as Proto from "game/prototypes";
import * as Utils from "game/utils";
import * as Intents from "./creep/CreepIntent";
import * as Nav from "game/path-finder";

export function inRange(
	targets: (actor: Proto.GameObject) => Proto.GameObject[],
	radius: Lib.Distance
): Func.Predicate<Proto.GameObject> {
	return (actor: Proto.GameObject): boolean => targets(actor).some(target => actor.getRangeTo(target) <= radius);
}

export function inRangeForIntent(intent: Intent.Intent) {
	return (actor: Proto.Creep, target: Proto.GameObject) => Utils.getRange(actor, target) <= Intent.RANGE[intent]!;
}

export function exists(targets: (actor: Proto.GameObject) => Proto.GameObject[]): Func.Predicate<Proto.GameObject> {
	return (actor: Proto.GameObject): boolean => targets(actor).length > 0;
}

export function healthAbovePercent(percent: number): Func.Predicate<{ hits?: number; hitsMax?: number }> {
	return (actor: { hits?: number; hitsMax?: number }): boolean =>
		actor.hits === undefined || actor.hitsMax === undefined || actor.hits / actor.hitsMax > percent;
}

export function hasResourceAmmount(amount: number): Func.Predicate<{ store: Proto.Store }> {
	return (actor: { store: Proto.Store }): boolean =>
		(actor.store.getUsedCapacity(Consts.RESOURCE_ENERGY) ?? 0) >= amount;
}

export function isFull(): Func.Predicate<{ store: Proto.Store }> {
	return (actor: { store: Proto.Store }): boolean => actor.store.getFreeCapacity(Consts.RESOURCE_ENERGY) === 0;
}

export function isSameTeam(actor: Lib.OwnedGameObject): Func.Predicate<Lib.OwnedGameObject> {
	return (target: Lib.OwnedGameObject): boolean => actor.my === target.my;
}

export function isOnTeam(team?: boolean): Func.Predicate<Lib.OwnedGameObject> {
	return (target: Lib.OwnedGameObject): boolean => target.my === team;
}

// Predicates
export const isEnemy = isOnTeam(false);
export const isAlly = isOnTeam(true);
export const isNeutral = isOnTeam(undefined);
export const isAttackPart = (part: Proto.BodyPartType) => part in [Consts.ATTACK, Consts.RANGED_ATTACK];
export const isArmed = (creep: Proto.Creep) => creep.body.some(isAttackPart);
export const isThreat = Func.and(isEnemy, isArmed);
export const isNotThreat = Func.not(isThreat);
export const isEnemyVillager = Func.and(isEnemy, isNotThreat);
export const hasEnergy = (container: { store: Proto.Store }) => container.store[Consts.RESOURCE_ENERGY] > 0;
export const isHurt = (target: Lib.Health) => target.hits! < target.hitsMax!;
export const isDead = (target: Lib.Health) => (target.hits ?? 1) > 0;
export const isEmpty = (actor: { store: Proto.Store }) =>
	(actor.store.getUsedCapacity(Consts.RESOURCE_ENERGY) ?? 0) === 0;
export const anyAlliesInjured = exists((_actor: Proto.GameObject) =>
	Utils.getObjectsByPrototype(Proto.Creep).filter(creep => creep.my && creep.hits < creep.hitsMax)
);
export const canTouchInjured = inRange(
	() => Utils.getObjectsByPrototype(Proto.Creep).filter(creep => creep.my && creep.hits < creep.hitsMax),
	Intents.RANGE[Intents.Intent.HEAL]!
);
export const canReachInjured = inRange(
	() => Utils.getObjectsByPrototype(Proto.Creep).filter(creep => creep.my && creep.hits < creep.hitsMax),
	Intents.RANGE[Intents.Intent.RANGED_HEAL]!
);
export const allyExists = exists(() =>
	Utils.getObjectsByPrototype(Proto.Creep).filter(creep => creep.my && isArmed(creep))
);
export const isFullEnergy = isFull();

// Targeters
export function getClosestObstacle(actor: Proto.Creep): Proto.StructureWall | undefined {
	const searchRadius = 10;
	const spawn = Utils.getObjectsByPrototype(Proto.StructureSpawn).find(isAlly)!;
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
export const enemyHasCreeps = exists(() => Utils.getObjectsByPrototype(Proto.Creep).filter(isEnemy));
export const threatInShootingRange = inRange(
	() => Utils.getObjectsByPrototype(Proto.Creep).filter(isEnemy),
	Intents.RANGE[Intents.Intent.RANGED_ATTACK]!
);

export const enemyVillagers = () => Utils.getObjectsByPrototype(Proto.Creep).filter(isEnemyVillager);
export const enemySpawns = () => Utils.getObjectsByPrototype(Proto.StructureSpawn).filter(isEnemy);
export const friendlySpawns = () => Utils.getObjectsByPrototype(Proto.StructureSpawn).filter(isAlly);
export const threats = () => Utils.getObjectsByPrototype(Proto.Creep).filter(isThreat);
export const enemyCreeps = () => Utils.getObjectsByPrototype(Proto.Creep).filter(isEnemy);
export const neutralEnergySource = () =>
	Utils.getObjectsByPrototype(Proto.StructureContainer).filter(isNeutral).filter(hasEnergy);
export const friendlySites = () => Utils.getObjectsByPrototype(Proto.ConstructionSite).filter(isAlly);
export const injuredFriendlies = () => Utils.getObjectsByPrototype(Proto.Creep).filter(isAlly).filter(isHurt);
export const armedFriendlies = () => Utils.getObjectsByPrototype(Proto.Creep).filter(isAlly).filter(isArmed);

export const inWithdrawRange = inRangeForIntent(Intents.Intent.WITHDRAW);
export const inBuildRange = inRangeForIntent(Intents.Intent.BUILD);
export const inAttackRange = inRangeForIntent(Intents.Intent.ATTACK);
export const inRangedAttackRange = inRangeForIntent(Intents.Intent.RANGED_ATTACK);
export const inHealRange = inRangeForIntent(Intents.Intent.HEAL);
export const inRangedHealRange = inRangeForIntent(Intents.Intent.RANGED_HEAL);
