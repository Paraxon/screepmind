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
import * as Intent from "./CreepIntent";
import { Role } from "./Role";
import { BoundAction } from "./action/BoundAction";
import { DepositResource } from "./action/DepositResource";
import { FleeThreats } from "./action/FleeThreats";
import { WithdrawResource } from "./action/WithdrawResource";

// Predicates
const isEnemy: Func.Predicate<Proto.GameObject> = (object: Lib.OwnedGameObject) => object.my === false;
const isArmed: Func.Predicate<Proto.Creep> = (creep: Proto.Creep) =>
	creep.body.some(({ type }) => type in [Intent.ATTACK, Intent.RANGED_ATTACK]);
const isThreat: Func.Predicate<Proto.Creep> = (creep: Proto.Creep) => isEnemy(creep) && isArmed(creep);
const isNotThreat: Func.Predicate<Proto.Creep> = (creep: Proto.Creep) => !isArmed(creep);
const isEnemyVillager: Func.Predicate<Proto.Creep> = (creep: Proto.Creep) => isEnemy(creep) && isNotThreat(creep);
const hasEnergy: Func.Predicate<Proto.StructureContainer> = (container: Proto.StructureContainer) =>
	container.store[Consts.RESOURCE_ENERGY] > 0;
const isInjured: Func.Predicate<Proto.Creep> = (creep: Proto.Creep) => creep.hits < creep.hitsMax;
const targetDead = <actor_t, target_t extends Lib.Health>(actor: actor_t, target: target_t) => (target.hits ?? 0) > 0;

// Reducers
const leastHealth = <target_t extends Lib.Health>(lhs: target_t, rhs: target_t) =>
	(lhs.hits ?? 0) < (rhs.hits ?? 0) ? lhs : rhs;

// Targeters
const enemyVillagers = (): Proto.Creep[] => Utils.getObjectsByPrototype(Proto.Creep).filter(isEnemyVillager);
const enemySpawns = (): Proto.StructureSpawn[] =>
	Utils.getObjectsByPrototype(Proto.StructureSpawn).filter(spawn => !spawn.my);
const friendlySpawns = (): Proto.StructureSpawn[] =>
	Utils.getObjectsByPrototype(Proto.StructureSpawn).filter(spawn => spawn.my);
const threats = (): Proto.Creep[] => Utils.getObjectsByPrototype(Proto.Creep).filter(isThreat);
const enemyCreeps = (): Proto.Creep[] => Utils.getObjectsByPrototype(Proto.Creep).filter(isEnemy);
const neutralEnergySource = (): Proto.StructureContainer[] =>
	Utils.getObjectsByPrototype(Proto.StructureContainer).filter(
		(container: Proto.StructureContainer) => container.my === undefined && container.store[Consts.RESOURCE_ENERGY] > 0
	);
const friendlySites = (): Proto.ConstructionSite[] =>
	Utils.getObjectsByPrototype(Proto.ConstructionSite).filter(site => site.my);
const injuredFriendlies = (): Proto.Creep[] =>
	Utils.getObjectsByPrototype(Proto.Creep).filter(creep => creep.my && isInjured(creep));
const armedFriendlies = (): Proto.Creep[] =>
	Utils.getObjectsByPrototype(Proto.Creep).filter(creep => creep.my && isArmed(creep));

const inWithdrawRange = Condition.inIntentRange(Intent.WITHDRAW);
const withdrawEnergy = new ActionSequence(
	new BoundAction(Proto.Creep.prototype.moveTo, (actor: Proto.Creep) =>
		Utils.getObjectsByPrototype(Proto.StructureContainer)
			.filter((container: Proto.StructureContainer) => hasEnergy(container) && inWithdrawRange(actor, container))
			.reduce((closest, current) =>
				!closest || Utils.getRange(actor, current) < Utils.getRange(actor, closest) ? current : closest
			)
	),
	new WithdrawResource(Proto.StructureContainer)
);
const deliverToSpawn = new ActionSequence(
	new BoundAction(Proto.Creep.prototype.moveTo, (actor: Proto.Creep) =>
		friendlySpawns().reduce((closest, current) =>
			!closest || Utils.getRange(actor, current) < Utils.getRange(actor, closest) ? current : closest
		)
	),
	new DepositResource(Proto.StructureSpawn)
);
const isFull = Condition.isFull();
export const hauler = new DecisionTree(isFull, deliverToSpawn, withdrawEnergy);

const moveToSite = new BoundAction(Proto.Creep.prototype.moveTo, (actor: Proto.Creep) =>
	friendlySites().reduce((closest, current) =>
		!closest || Utils.getRange(actor, current) < Utils.getRange(actor, closest) ? current : closest
	)
);
const build = new BoundAction(Proto.Creep.prototype.build, (actor: Proto.Creep) =>
	Utils.getObjectsByPrototype(Proto.ConstructionSite)
		.filter(site => site.my)
		.filter(site => site.progress !== undefined || site.progressTotal !== undefined)
		.filter(site => Utils.getRange(actor, site) <= Intent.RANGE[Intent.BUILD]!)
		.reduce((closest, current) =>
			!closest || current.progressTotal! - current.progress! < closest.progressTotal! - closest.progress!
				? current
				: closest
		)
);
const moveBuild = new ActionSequence(moveToSite, build);
export const builder = new DecisionTree(isFull, moveBuild, withdrawEnergy);

const ignoreSwamp: Utils.FindPathOptions = { swampCost: Lib.PATH_COST[Consts.TERRAIN_PLAIN] };
const enemyHasCreeps = Condition.exists(() => Utils.getObjectsByPrototype(Proto.Creep).filter(isEnemy));
const threatInShootingRange = Condition.inRange(
	() => Utils.getObjectsByPrototype(Proto.Creep).filter(isEnemy),
	Intent.RANGE[Intent.RANGED_ATTACK]!
);
const fleeThreats = new FleeThreats(
	Proto.Creep,
	Intent.RANGE[Intent.RANGED_ATTACK]!,
	(actor: any, threat: Proto.Creep) => isThreat(threat),
	ignoreSwamp
);
const moveToEnemyVillager = new BoundAction(Proto.Creep.prototype.moveTo, (actor: Proto.Creep) =>
	enemyVillagers().reduce((closest, current) =>
		!closest || Utils.getRange(actor, current) < Utils.getRange(actor, closest) ? current : closest
	)
);
const attackVillager = new BoundAction(Proto.Creep.prototype.attack, (actor: Proto.Creep) =>
	Utils.getObjectsByPrototype(Proto.Creep)
		.filter(creep => !creep.my && !isArmed(creep))
		.filter(creep => Utils.getRange(actor, creep) <= Intent.RANGE[Intent.ATTACK]!)
		.reduce((lowest, current) => (!lowest || current.hits < lowest.hits ? current : lowest))
);
const moveToEnemySpawn = new BoundAction(Proto.Creep.prototype.moveTo, (actor: Proto.Creep) =>
	enemySpawns().reduce((closest, current) =>
		!closest || Utils.getRange(actor, current) < Utils.getRange(actor, closest) ? current : closest
	)
);
const attackEnemySpawn = new BoundAction(Proto.Creep.prototype.attack, (actor: Proto.Creep) =>
	Utils.getObjectsByPrototype(Proto.StructureSpawn)
		.filter(spawn => !spawn.my)
		.filter(spawn => Utils.getRange(actor, spawn) <= Intent.RANGE[Intent.ATTACK]!)
		.filter(spawn => spawn.hits !== undefined)
		.reduce((lowest, current) => (!lowest || current.hits! < lowest.hits! ? current : lowest))
);
const moveAttackVillagers = new ActionSequence(moveToEnemyVillager, attackVillager);
const moveAttackSpawn = new ActionSequence(moveToEnemySpawn, attackEnemySpawn);
const attackCreeps = new DecisionTree(threatInShootingRange, fleeThreats, moveAttackVillagers);
export const raider = new DecisionTree(enemyHasCreeps, attackCreeps, moveAttackSpawn);

const enemyHasThreats = Condition.exists(() => Utils.getObjectsByPrototype(Proto.Creep).filter(isEnemy));
const threatApproachingMelee = Condition.inRange(
	() => Utils.getObjectsByPrototype(Proto.Creep).filter(isEnemy),
	Intent.RANGE[Intent.ATTACK]! + 1
);
const moveToThreat = new BoundAction(Proto.Creep.prototype.moveTo, (actor: Proto.Creep) =>
	threats().reduce((closest, current) =>
		!closest || Utils.getRange(actor, current) < Utils.getRange(actor, closest) ? current : closest
	)
);
const shootLowest = new BoundAction(Proto.Creep.prototype.rangedAttack, (actor: Proto.Creep) =>
	Utils.getObjectsByPrototype(Proto.Creep)
		.filter(creep => !creep.my)
		.reduce((lowest, current) => (!lowest || current.hits < lowest.hits ? current : lowest))
);
const moveShootThreats = new ActionSequence(moveToThreat, shootLowest);
const kiteThreats = new DecisionTree(threatApproachingMelee, fleeThreats, moveShootThreats);
const shootEnemySpawn = new BoundAction(Proto.Creep.prototype.rangedAttack, (actor: Proto.Creep) =>
	Utils.getObjectsByPrototype(Proto.StructureSpawn)
		.filter(spawn => !spawn.my)
		.filter(spawn => spawn.hits !== undefined)
		.reduce((lowest, current) => (!lowest || current.hits! < lowest.hits! ? current : lowest))
);
const moveRangeEnemySpawn = new BoundAction(Proto.Creep.prototype.moveTo, (actor: Proto.Creep) =>
	enemySpawns().reduce((closest, current) =>
		!closest || Utils.getRange(actor, current) < Utils.getRange(actor, closest) ? current : closest
	)
);
const moveShootSpawn = new ActionSequence(moveRangeEnemySpawn, shootEnemySpawn);
export const kiter = new DecisionTree(enemyHasThreats, kiteThreats, moveShootSpawn);

const isSelfHurt = Func.not(Condition.healthAbovePercent(0.5));
const healSelf = new BoundAction(Proto.Creep.prototype.heal, (actor: Proto.Creep) => actor);
const anyAlliesInjured = Condition.exists((_actor: Proto.GameObject) =>
	Utils.getObjectsByPrototype(Proto.Creep).filter(creep => creep.my && creep.hits < creep.hitsMax)
);
const canTouchInjured = Condition.inRange(
	() => Utils.getObjectsByPrototype(Proto.Creep).filter(creep => creep.my && creep.hits < creep.hitsMax),
	Intent.RANGE[Intent.HEAL]!
);
const touchHeal = new BoundAction(Proto.Creep.prototype.heal, (actor: Proto.Creep) =>
	Utils.getObjectsByPrototype(Proto.Creep)
		.filter(creep => creep.my && creep.hits < creep.hitsMax)
		.filter(creep => Utils.getRange(actor, creep) <= Intent.RANGE[Intent.HEAL]!)
		.reduce((lowest, current) => (!lowest || current.hits < lowest.hits ? current : lowest))
);
const canReachInjured = Condition.inRange(
	() => Utils.getObjectsByPrototype(Proto.Creep).filter(creep => creep.my && creep.hits < creep.hitsMax),
	Intent.RANGE[Intent.RANGED_HEAL]!
);
const rangedHeal = new BoundAction(Proto.Creep.prototype.rangedHeal, (actor: Proto.Creep) =>
	Utils.getObjectsByPrototype(Proto.Creep)
		.filter(creep => creep.my && creep.hits < creep.hitsMax)
		.filter(creep => Utils.getRange(actor, creep) <= Intent.RANGE[Intent.RANGED_HEAL]!)
		.reduce((lowest, current) => (!lowest || current.hits < lowest.hits ? current : lowest))
);
const moveToWounded = new BoundAction(Proto.Creep.prototype.moveTo, (actor: Proto.Creep) =>
	injuredFriendlies().reduce((closest, current) =>
		!closest || Utils.getRange(actor, current) < Utils.getRange(actor, closest) ? current : closest
	)
);
const allyExists = Condition.exists(() =>
	Utils.getObjectsByPrototype(Proto.Creep).filter(creep => creep.my && isArmed(creep))
);
const followAlly = new BoundAction(Proto.Creep.prototype.moveTo, (actor: Proto.Creep) =>
	armedFriendlies().reduce((closest, current) =>
		!closest || Utils.getRange(actor, current) < Utils.getRange(actor, closest) ? current : closest
	)
);
const goHome = new BoundAction(Proto.Creep.prototype.moveTo, (actor: Proto.Creep) =>
	friendlySpawns().reduce((closest, current) =>
		!closest || Utils.getRange(actor, current) < Utils.getRange(actor, closest) ? current : closest
	)
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

// const harvestEnergy = new ActionSequence(
// 	new MoveToNearest(Source),
// 	new HarvestResource());
// export const harvesterDecisionTree = new DecisionTree(isFull, deliverToSpawn, harvestEnergy);

// const withdraw = new State("withdraw", withdrawEnergy);
// const deliver = new State("deliver", deliverToSpawn);
// const states = new AdjList(
// 	[withdraw, deliver],
// 	[new Transition(withdraw, deliver, isFull), new Transition(deliver, withdraw, isEmpty)])
// export const haulerFSM = new StateMachine<Proto.CreepMind, ScreepsReturnCode>(withdraw, states);
