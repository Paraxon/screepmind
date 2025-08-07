import { DecisionTree } from "common/decisions/DecisionTree";
import { ActionSequence } from "common/decisions/actions/ActionSequence";
import { Targeter } from "common/gameobject/Targeter";
import * as Lib from "common/library";
import * as Consts from "game/constants";
import * as Proto from "game/prototypes";
import * as Utils from "game/utils";
import { FindPathOptions } from "game/utils";
import { TEAM_ENEMY, TEAM_FRIENDLY, TEAM_NEUTRAL } from "../../entity/team/Team";
import { AnyInRange } from "../condition/AnyInRange";
import { FindAny } from "../condition/FindAny";
import { RelativeCapacity } from "../condition/RelativeCapacity";
import { RelativeHealth } from "../condition/RelativeHealth";
import { CreepBuilder } from "./CreepBuilder";
import { CreepClassifier } from "./CreepClassifier";
import * as Intent from "./CreepIntent";
import { Role } from "./Role";
import { AttackLowest } from "./action/AttackLowest";
import { BoundAction } from "./action/BoundAction";
import { BuildAtSite } from "./action/BuildAtSite";
import { DepositResource } from "./action/DepositResource";
import { FleeThreats } from "./action/FleeThreats";
import { MoveToNearest } from "./action/MoveToNearest";
import { RangedHeal } from "./action/RangedHeal";
import { TouchHeal } from "./action/TouchHeal";
import { WithdrawResource } from "./action/WithdrawResource";

// Predicates
const isEnemy: Lib.Predicate<Proto.GameObject> = (object: Lib.OwnedGameObject) => object.my === false;
const isArmed: Lib.Predicate<Proto.Creep> = (creep: Proto.Creep) =>
	creep.body.some(({ type }) => type in [Intent.ATTACK, Intent.RANGED_ATTACK]);
const isThreat: Lib.Predicate<Proto.Creep> = (creep: Proto.Creep) => isEnemy(creep) && isArmed(creep);
const isNotThreat: Lib.Predicate<Proto.Creep> = (creep: Proto.Creep) => !isArmed(creep);
const isEnemyVillager: Lib.Predicate<Proto.Creep> = (creep: Proto.Creep) => isEnemy(creep) && isNotThreat(creep);
const hasEnergy: Lib.Predicate<Proto.StructureContainer> = (container: Proto.StructureContainer) =>
	container.store[Consts.RESOURCE_ENERGY] > 0;
const isInjured: Lib.Predicate<Proto.Creep> = (creep: Proto.Creep) => creep.hits < creep.hitsMax;
const targetDead = <actor_t, target_t extends Lib.Health>(actor: actor_t, target: target_t) => (target.hits ?? 0) > 0;

// Reducers
const leastHealth = <target_t extends Lib.Health>(lhs: target_t, rhs: target_t) =>
	(lhs.hits ?? 0) < (rhs.hits ?? 0) ? lhs : rhs;

// Targeters
const enemyVillagers = new Targeter(TEAM_ENEMY, Proto.Creep, isNotThreat);
const enemySpawn = new Targeter(TEAM_ENEMY, Proto.StructureSpawn, () => true);
const friendlySpawn = new Targeter(TEAM_FRIENDLY, Proto.StructureSpawn, () => true);
const threats = new Targeter(TEAM_ENEMY, Proto.Creep, isArmed);
const enemyCreeps = new Targeter(TEAM_ENEMY, Proto.Creep, () => true);
const energySource = new Targeter(TEAM_NEUTRAL, Proto.StructureContainer, hasEnergy);
const friendlySites = new Targeter<Proto.ConstructionSite>(TEAM_FRIENDLY, Proto.ConstructionSite, () => true);
const injuredFriendlies = new Targeter<Proto.Creep>(
	TEAM_FRIENDLY,
	Proto.Creep,
	(creep: { hits: number; hitsMax: number }) => creep.hits < creep.hitsMax
);
const armedFriendlies = new Targeter(TEAM_FRIENDLY, Proto.Creep, isArmed);

const withdrawEnergy = new ActionSequence(
	new MoveToNearest(energySource, Intent.RANGE[Intent.WITHDRAW]),
	new WithdrawResource(Proto.StructureContainer)
);
const deliverToSpawn = new ActionSequence(
	new MoveToNearest(friendlySpawn, Intent.RANGE[Intent.TRANSFER]),
	new DepositResource(Proto.StructureSpawn)
);
const isFull = new RelativeCapacity(1);
export const hauler = new DecisionTree(isFull, deliverToSpawn, withdrawEnergy);

const moveToSite = new MoveToNearest(friendlySites, Intent.RANGE[Intent.BUILD]);
const build = new BuildAtSite(friendlySites);
const moveBuild = new ActionSequence(moveToSite, build);
export const builder = new DecisionTree(isFull, moveBuild, withdrawEnergy);

const ignoreSwamp: FindPathOptions = { swampCost: Lib.PATH_COST[Consts.TERRAIN_PLAIN] };
const enemyHasCreeps = new FindAny(enemyCreeps);
const threatInShootingRange = new AnyInRange(threats, Intent.RANGE[Intent.RANGED_ATTACK]!);
const fleeThreats = new FleeThreats(
	Proto.Creep,
	Intent.RANGE[Intent.RANGED_ATTACK]!,
	(actor: any, threat: Proto.Creep) => isThreat(threat),
	ignoreSwamp
);
const moveToEnemyVillager = new MoveToNearest(enemyVillagers, Intent.RANGE[Intent.ATTACK], ignoreSwamp);
const attackVillager = new AttackLowest(enemyVillagers);
const moveToEnemySpawn = new MoveToNearest(enemySpawn, Intent.RANGE[Intent.ATTACK], ignoreSwamp);
const attackEnemySpawn = new AttackLowest(enemySpawn);
const moveAttackVillagers = new ActionSequence(moveToEnemyVillager, attackVillager);
const moveAttackSpawn = new ActionSequence(moveToEnemySpawn, attackEnemySpawn);
const attackCreeps = new DecisionTree(threatInShootingRange, fleeThreats, moveAttackVillagers);
export const raider = new DecisionTree(enemyHasCreeps, attackCreeps, moveAttackSpawn);

const enemyHasThreats = new FindAny(threats);
const threatApproachingMelee = new AnyInRange(threats, Intent.RANGE[Intent.ATTACK]! + 1);
const moveToThreat = new MoveToNearest(threats, Intent.RANGE[Intent.RANGED_ATTACK], ignoreSwamp);
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
const moveRangeEnemySpawn = new MoveToNearest(enemySpawn, Intent.RANGE[Intent.RANGED_ATTACK], ignoreSwamp);
const moveShootSpawn = new ActionSequence(moveRangeEnemySpawn, shootEnemySpawn);
export const kiter = new DecisionTree(enemyHasThreats, kiteThreats, moveShootSpawn);

const isSelfHurt = new RelativeHealth(1, Lib.less);
const healSelf = new TouchHeal(injuredFriendlies); // TODO: Create self-targeter
const anyAlliesInjured = new FindAny(injuredFriendlies);
const canTouchInjured = new AnyInRange(injuredFriendlies, Intent.RANGE[Intent.HEAL]!);
const touchHeal = new TouchHeal(injuredFriendlies);
const canReachInjured = new AnyInRange(injuredFriendlies, Intent.RANGE[Intent.RANGED_HEAL]!);
const rangedHeal = new RangedHeal(injuredFriendlies);
const moveToWounded = new MoveToNearest(injuredFriendlies, Intent.RANGE[Intent.HEAL], ignoreSwamp);
const allyExists = new FindAny(armedFriendlies);
const followAlly = new MoveToNearest(armedFriendlies, Intent.RANGE[Intent.RANGED_HEAL]);
const goHome = new MoveToNearest(friendlySpawn);
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
