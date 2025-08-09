import * as Func from "common/Functional";
import { DecisionTree } from "common/decisions/DecisionTree";
import { ActionSequence } from "common/decisions/actions/ActionSequence";
import * as Lib from "common/library";
import * as Consts from "game/constants";
import * as Proto from "game/prototypes";
import * as Utils from "game/utils";
import * as Condition from "../Conditions";
import { CreepBuilder } from "./CreepBuilder";
import { CreepClassifier } from "./CreepClassifier";
import { Intent, RANGE, transferEnergyAction, withdrawEnergyAction } from "./CreepIntent";
import { Role } from "./Role";
import { BoundAction } from "./action/BoundAction";
import { FleeThreats } from "./action/FleeThreats";
import * as Result from "../Result";
import { Action } from "common/decisions/DecisionMaker";

// Predicates
const isEnemy = Condition.isOnTeam(false);
const isAlly = Condition.isOnTeam(true);
const isNeutral = Condition.isOnTeam(undefined);
const isAttackPart = (part: Proto.BodyPartType) => part in [Consts.ATTACK, Consts.RANGED_ATTACK];
const isArmed = (creep: Proto.Creep) => creep.body.some(isAttackPart);
const isThreat = Func.and(isEnemy, isArmed);
const isNotThreat = Func.not(isThreat);
const isEnemyVillager = Func.and(isEnemy, isNotThreat);
const hasEnergy = (container: { store: Proto.Store }) => container.store[Consts.RESOURCE_ENERGY] > 0;
const isHurt = (target: Lib.Health) => target.hits! < target.hitsMax!;
const isDead = (target: Lib.Health) => (target.hits ?? 1) > 0;
const isFull = Condition.isFull();
const isEmpty = (actor: { store: Proto.Store }) => (actor.store.getUsedCapacity(Consts.RESOURCE_ENERGY) ?? 0) === 0;
const anyAlliesInjured = Condition.exists((_actor: Proto.GameObject) =>
	Utils.getObjectsByPrototype(Proto.Creep).filter(creep => creep.my && creep.hits < creep.hitsMax)
);
const canTouchInjured = Condition.inRange(
	() => Utils.getObjectsByPrototype(Proto.Creep).filter(creep => creep.my && creep.hits < creep.hitsMax),
	RANGE[Intent.HEAL]!
);
const canReachInjured = Condition.inRange(
	() => Utils.getObjectsByPrototype(Proto.Creep).filter(creep => creep.my && creep.hits < creep.hitsMax),
	RANGE[Intent.RANGED_HEAL]!
);
const allyExists = Condition.exists(() =>
	Utils.getObjectsByPrototype(Proto.Creep).filter(creep => creep.my && isArmed(creep))
);

// Reducers
const leastHealthCreep = (lowest: Proto.Creep | undefined, current: Proto.Creep) =>
	!lowest || current.hits! < lowest.hits! ? current : lowest;
const leastHealthSpawn = (lowest: Proto.StructureSpawn, current: Proto.StructureSpawn) =>
	current.hits! < lowest.hits! ? current : lowest;
const mostEnergy = (most: Proto.StructureContainer | undefined, current: Proto.StructureContainer) =>
	!most || current.store[Consts.RESOURCE_ENERGY] > most.store[Consts.RESOURCE_ENERGY] ? current : most;
function closestTo<target_t extends Proto.GameObject>(
	actor: Proto.GameObject
): (closest: target_t | undefined, current: target_t) => target_t {
	return (closest: target_t | undefined, current: target_t) =>
		!closest || Utils.getRange(actor, current) < Utils.getRange(actor, closest) ? current : closest;
}
const mostComplete = (closest: Proto.ConstructionSite | undefined, current: Proto.ConstructionSite) =>
	!closest || current.progressTotal! - current.progress! < closest.progressTotal! - closest.progress!
		? current
		: closest;
const enemyHasCreeps = Condition.exists(() => Utils.getObjectsByPrototype(Proto.Creep).filter(isEnemy));
const threatInShootingRange = Condition.inRange(
	() => Utils.getObjectsByPrototype(Proto.Creep).filter(isEnemy),
	RANGE[Intent.RANGED_ATTACK]!
);

const enemyVillagers = () => Utils.getObjectsByPrototype(Proto.Creep).filter(isEnemyVillager);
const enemySpawns = () => Utils.getObjectsByPrototype(Proto.StructureSpawn).filter(isEnemy);
const friendlySpawns = () => Utils.getObjectsByPrototype(Proto.StructureSpawn).filter(isAlly);
const threats = () => Utils.getObjectsByPrototype(Proto.Creep).filter(isThreat);
const enemyCreeps = () => Utils.getObjectsByPrototype(Proto.Creep).filter(isEnemy);
const neutralEnergySource = () =>
	Utils.getObjectsByPrototype(Proto.StructureContainer).filter(isNeutral).filter(hasEnergy);
const friendlySites = () => Utils.getObjectsByPrototype(Proto.ConstructionSite).filter(isAlly);
const injuredFriendlies = () => Utils.getObjectsByPrototype(Proto.Creep).filter(isAlly).filter(isHurt);
const armedFriendlies = () => Utils.getObjectsByPrototype(Proto.Creep).filter(isAlly).filter(isArmed);

const inWithdrawRange = Condition.inRangeForIntent(Intent.WITHDRAW);
const inBuildRange = Condition.inRangeForIntent(Intent.BUILD);
const inAttackRange = Condition.inRangeForIntent(Intent.ATTACK);
const inShootingRange = Condition.inRangeForIntent(Intent.RANGED_ATTACK);
const inHealRange = Condition.inRangeForIntent(Intent.HEAL);
const inRangedHealRange = Condition.inRangeForIntent(Intent.RANGED_HEAL);

const withdrawEnergy = new ActionSequence(
	new BoundAction(
		Proto.Creep.prototype.moveTo,
		actor =>
			Utils.findClosestByPath(
				Utils.getObjectsByPrototype(Proto.StructureSpawn).find(isAlly)!,
				Utils.getObjectsByPrototype(Proto.StructureContainer).filter(hasEnergy)
			),
		(actor, target) => inWithdrawRange(actor, target)
	),
	new BoundAction(
		withdrawEnergyAction,
		actor =>
			Utils.getObjectsByPrototype(Proto.StructureContainer)
				.filter(container => inWithdrawRange(actor, container))
				.reduce(mostEnergy),
		(actor, target) => actor.store.getFreeCapacity(Consts.RESOURCE_ENERGY) === 0
	)
);
const deliverToSpawn = new ActionSequence(
	new BoundAction(
		Proto.Creep.prototype.moveTo,
		actor => friendlySpawns().reduce(closestTo(actor)),
		(actor, target) => inWithdrawRange(actor, target)
	),
	new BoundAction(
		transferEnergyAction,
		actor => friendlySpawns().reduce(closestTo(actor)),
		(actor, target) => isEmpty(actor)
	)
);
export const hauler = new DecisionTree(isFull, deliverToSpawn, withdrawEnergy);

const moveToSite = new BoundAction(
	Proto.Creep.prototype.moveTo,
	actor => friendlySites().reduce(closestTo(actor)),
	(actor, target) => inBuildRange(actor, target)
);
const build = new BoundAction(Proto.Creep.prototype.build, actor =>
	Utils.getObjectsByPrototype(Proto.ConstructionSite)
		.filter(isAlly)
		.filter(target => inBuildRange(actor, target))
		.reduce(mostComplete)
);
const moveBuild = new ActionSequence(moveToSite, build);
export const builder = new DecisionTree(isFull, moveBuild, withdrawEnergy);

const ignoreSwamp: Utils.FindPathOptions = { swampCost: Lib.PATH_COST[Consts.TERRAIN_PLAIN] };
const fleeThreats = new FleeThreats(
	Proto.Creep,
	RANGE[Intent.RANGED_ATTACK]!,
	(actor: any, threat: Proto.Creep) => isThreat(threat),
	ignoreSwamp
);
const moveToEnemyVillager = new BoundAction(
	Proto.Creep.prototype.moveTo,
	(actor: Proto.Creep) => enemyVillagers().reduce(closestTo(actor)),
	(actor, target) => inAttackRange(actor, target)
);
const attackVillager = new BoundAction(Proto.Creep.prototype.attack, (actor: Proto.Creep) =>
	Utils.getObjectsByPrototype(Proto.Creep)
		.filter(isThreat)
		.filter(creep => inAttackRange(actor, creep))
		.reduce(leastHealthCreep)
);
const moveToEnemySpawn = new BoundAction(
	Proto.Creep.prototype.moveTo,
	actor => enemySpawns().reduce(closestTo(actor)),
	(actor, target) => inAttackRange(actor, target)
);
const attackEnemySpawn = new BoundAction(Proto.Creep.prototype.attack, actor =>
	Utils.getObjectsByPrototype(Proto.StructureSpawn)
		.filter(isEnemy)
		.filter(spawn => inAttackRange(actor, spawn))
		.reduce(leastHealthSpawn)
);
const moveAttackVillagers = new ActionSequence(moveToEnemyVillager, attackVillager);
const moveAttackSpawn = new ActionSequence(moveToEnemySpawn, attackEnemySpawn);
const attackCreeps = new DecisionTree(threatInShootingRange, fleeThreats, moveAttackVillagers);
export const raider = new DecisionTree(enemyHasCreeps, attackCreeps, moveAttackSpawn);

const enemyHasThreats = Condition.exists(() => Utils.getObjectsByPrototype(Proto.Creep).filter(isEnemy));
const threatApproachingMelee = Condition.inRange(
	() => Utils.getObjectsByPrototype(Proto.Creep).filter(isEnemy),
	RANGE[Intent.ATTACK]! + 1
);
const moveToThreat = new BoundAction(
	Proto.Creep.prototype.moveTo,
	actor => threats().reduce(closestTo(actor)),
	(actor, target) => inShootingRange(actor, target)
);
const shootLowest = new BoundAction(Proto.Creep.prototype.rangedAttack, actor =>
	Utils.getObjectsByPrototype(Proto.Creep).filter(isEnemy).reduce(leastHealthCreep)
);
const moveShootThreats = new ActionSequence(moveToThreat, shootLowest);
const kiteThreats = new DecisionTree(threatApproachingMelee, fleeThreats, moveShootThreats);
const shootEnemySpawn = new BoundAction(Proto.Creep.prototype.rangedAttack, actor =>
	Utils.getObjectsByPrototype(Proto.StructureSpawn).filter(isEnemy).reduce(leastHealthSpawn)
);
const moveRangeEnemySpawn = new BoundAction(
	Proto.Creep.prototype.moveTo,
	actor => enemySpawns().reduce(closestTo(actor)),
	(actor, target) => inShootingRange(actor, target)
);
const moveShootSpawn = new ActionSequence(moveRangeEnemySpawn, shootEnemySpawn);
export const kiter = new DecisionTree(enemyHasThreats, kiteThreats, moveShootSpawn);

const isSelfHurt = Func.not(Condition.healthAbovePercent(0.5));
const healSelf = new BoundAction(
	Proto.Creep.prototype.heal,
	actor => actor,
	(actor, target) => actor.hits >= actor.hitsMax
);

const touchHeal = new BoundAction(Proto.Creep.prototype.heal, actor =>
	Utils.getObjectsByPrototype(Proto.Creep)
		.filter(isAlly)
		.filter(creep => inHealRange(actor, creep))
		.reduce(leastHealthCreep)
);

const rangedHeal = new BoundAction(Proto.Creep.prototype.rangedHeal, actor =>
	Utils.getObjectsByPrototype(Proto.Creep)
		.filter(isAlly)
		.filter(isHurt)
		.filter(creep => inRangedHealRange(actor, creep))
		.reduce(leastHealthCreep)
);
const moveToWounded = new BoundAction(
	Proto.Creep.prototype.moveTo,
	actor => injuredFriendlies().reduce(closestTo(actor)),
	(actor, target) => inRangedHealRange(actor, target)
);

const followAlly = new BoundAction(
	Proto.Creep.prototype.moveTo,
	actor => armedFriendlies().reduce(closestTo(actor)),
	(actor, target) => inRangedHealRange(actor, target)
);
const goHome = new BoundAction(
	Proto.Creep.prototype.moveTo,
	actor => friendlySpawns().reduce(closestTo(actor)),
	(actor, target) => inRangedHealRange(actor, target)
);
const rangedHealOrMove = new DecisionTree(canReachInjured, rangedHeal, moveToWounded);
const touchOrRangedHeal = new DecisionTree(canTouchInjured, touchHeal, rangedHealOrMove);
const moveToSafety = new DecisionTree(allyExists, followAlly, goHome);
const healOrPosition = new DecisionTree(anyAlliesInjured, touchOrRangedHeal, moveToSafety);
const medic = new DecisionTree(isSelfHurt, healSelf, healOrPosition);

export const roles: Role[] = [
	new Role(
		"raider",
		new CreepBuilder().with(Consts.ATTACK).enableMovement(Consts.TERRAIN_SWAMP),
		raider,
		[[Consts.ATTACK, 1]],
		0,
		33
	),
	new Role(
		"kiter",
		new CreepBuilder().with(Consts.RANGED_ATTACK).enableMovement(Consts.TERRAIN_SWAMP),
		kiter,
		[[Consts.RANGED_ATTACK, 1]],
		0,
		50
	),
	new Role("hauler", new CreepBuilder().with(Consts.CARRY).enableMovement(), hauler, [[Consts.CARRY, 1]], 2, 100),
	new Role(
		"builder",
		new CreepBuilder().with(Consts.CARRY).with(Consts.WORK).enableMovement(),
		builder,
		[[Intent.BUILD, 1]],
		1,
		200
	),
	new Role(
		"medic",
		new CreepBuilder().with(Consts.HEAL).enableMovement(Consts.TERRAIN_SWAMP),
		medic,
		[[Intent.HEAL, 1]],
		1,
		150
	)
];

export const classifier = new CreepClassifier<Role>();
roles.forEach(role => classifier.add(role, role.features));
