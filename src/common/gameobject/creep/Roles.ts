import { Health, OwnedGameObject, PATH_COST, Predicate, less } from "common/library";
import { DecisionTree } from "common/decisions/DecisionTree";
import { ActionSequence } from "common/decisions/actions/ActionSequence";
import { Targeter } from "common/gameobject/Targeter";
import { BUILD, HARVEST, INTENT_RANGE, RANGED_HEAL, TRANSFER, WITHDRAW } from "common/gameobject/creep/CreepIntent";
import {
	ATTACK,
	CARRY,
	HEAL,
	MOVE,
	RANGED_ATTACK,
	RESOURCE_ENERGY,
	TERRAIN_PLAIN,
	TERRAIN_SWAMP,
	WORK
} from "game/constants";
import { ConstructionSite, Creep, GameObject, StructureContainer, StructureSpawn } from "game/prototypes";
import { FindPathOptions } from "game/utils";
import { TEAM_ENEMY, TEAM_FRIENDLY, TEAM_NEUTRAL } from "../../entity/team/Team";
import { ScreepsResult } from "../Result";
import { AnyInRange } from "../condition/AnyInRange";
import { FindAny } from "../condition/FindAny";
import { RelativeCapacity } from "../condition/RelativeCapacity";
import { RelativeHealth } from "../condition/RelativeHealth";
import { BodyRatio } from "./BodyRatio";
import { CreepClassifier } from "./CreepClassifier";
import { Role } from "./Role";
import { AttackLowest } from "./action/AttackLowest";
import { BuildAtSite } from "./action/BuildAtSite";
import { DepositResource } from "./action/DepositResource";
import { FleeThreats } from "./action/FleeThreats";
import { MoveToNearest } from "./action/MoveToNearest";
import { RangedHeal } from "./action/RangedHeal";
import { SingleTargetAction } from "./action/SingleTargetAction";
import { TouchHeal } from "./action/TouchHeal";
import { WithdrawResource } from "./action/WithdrawResource";
import { Logger } from "common/patterns/Logger";

// Predicates
const isEnemy: Predicate<GameObject> = (object: OwnedGameObject) => object.my === false;
const isArmed: Predicate<Creep> = (creep: Creep) =>
	creep.body.some(({ type, hits }) => type === ATTACK || type === RANGED_ATTACK);
const isThreat: Predicate<Creep> = (creep: Creep) => isEnemy(creep) && isArmed(creep);
const isVillager: Predicate<Creep> = (creep: Creep) => !isArmed(creep);
const isEnemyVillager: Predicate<Creep> = (creep: Creep) => isEnemy(creep) && isVillager(creep);
const hasEnergy: Predicate<StructureContainer> = (container: StructureContainer) =>
	container.store[RESOURCE_ENERGY] > 0;
const isInjured: Predicate<Creep> = (creep: Creep) => creep.hits < creep.hitsMax;
const targetDead = <actor_t, target_t extends Health>(actor: actor_t, target: target_t) => (target.hits ?? 0) > 0;

// Reducers
const leastHealth = <target_t extends Health>(lhs: target_t, rhs: target_t) =>
	(lhs.hits ?? 0) < (rhs.hits ?? 0) ? lhs : rhs;

// Targeters
const enemyVillagers = new Targeter(TEAM_ENEMY, Creep, isVillager);
const enemySpawn = new Targeter(TEAM_ENEMY, StructureSpawn, () => true);
const friendlySpawn = new Targeter(TEAM_FRIENDLY, StructureSpawn, () => true);
const threats = new Targeter(TEAM_ENEMY, Creep, isArmed);
const enemyCreeps = new Targeter(TEAM_ENEMY, Creep, () => true);
const energySource = new Targeter(TEAM_NEUTRAL, StructureContainer, hasEnergy);
const friendlySites = new Targeter<ConstructionSite>(TEAM_FRIENDLY, ConstructionSite, () => true);
const injuredFriendlies = new Targeter<Creep>(
	TEAM_FRIENDLY,
	Creep,
	(creep: { hits: number; hitsMax: number }) => creep.hits < creep.hitsMax
);
const armedFriendlies = new Targeter(TEAM_FRIENDLY, Creep, isArmed);

const withdrawEnergy = new ActionSequence(
	new MoveToNearest(energySource, INTENT_RANGE[WITHDRAW]),
	new WithdrawResource(StructureContainer)
);
const deliverToSpawn = new ActionSequence(
	new MoveToNearest(friendlySpawn, INTENT_RANGE[TRANSFER]),
	new DepositResource(StructureSpawn)
);
const isFull = new RelativeCapacity(1);
export const hauler = new DecisionTree(isFull, deliverToSpawn, withdrawEnergy);

const moveToSite = new MoveToNearest(friendlySites, INTENT_RANGE[BUILD]);
const build = new BuildAtSite(friendlySites);
const moveBuild = new ActionSequence(moveToSite, build);
export const builder = new DecisionTree(isFull, moveBuild, withdrawEnergy);

const ignoreSwamp: FindPathOptions = { swampCost: PATH_COST[TERRAIN_PLAIN] };
const enemyHasCreeps = new FindAny(enemyCreeps);
const threatInShootingRange = new AnyInRange(threats, INTENT_RANGE[RANGED_ATTACK]!);
const fleeThreats = new FleeThreats(
	Creep,
	INTENT_RANGE[RANGED_ATTACK]!,
	(actor: any, threat: Creep) => isThreat(threat),
	ignoreSwamp
);
const moveToEnemyVillager = new MoveToNearest(enemyVillagers, INTENT_RANGE[ATTACK], ignoreSwamp);
const attackVillager = new AttackLowest(enemyVillagers);
const moveToEnemySpawn = new MoveToNearest(enemySpawn, INTENT_RANGE[ATTACK], ignoreSwamp);
const attackEnemySpawn = new AttackLowest(enemySpawn);
const moveAttackVillagers = new ActionSequence(moveToEnemyVillager, attackVillager);
const moveAttackSpawn = new ActionSequence(moveToEnemySpawn, attackEnemySpawn);
const attackCreeps = new DecisionTree(threatInShootingRange, fleeThreats, moveAttackVillagers);
export const raider = new DecisionTree(enemyHasCreeps, attackCreeps, moveAttackSpawn);

const enemyHasThreats = new FindAny(threats);
const threatApproachingMelee = new AnyInRange(threats, INTENT_RANGE[ATTACK]! + 1);
const moveToThreat = new MoveToNearest(threats, INTENT_RANGE[RANGED_ATTACK], ignoreSwamp);
const shootLowest = new SingleTargetAction(threats, leastHealth, Creep.prototype.rangedAttack, targetDead);
const moveShootThreats = new ActionSequence(moveToThreat, shootLowest);
const kiteThreats = new DecisionTree(threatApproachingMelee, fleeThreats, moveShootThreats);
const shootEnemySpawn = new SingleTargetAction(enemySpawn, leastHealth, Creep.prototype.rangedAttack, targetDead);
const moveRangeEnemySpawn = new MoveToNearest(enemySpawn, INTENT_RANGE[RANGED_ATTACK], ignoreSwamp);
const moveShootSpawn = new ActionSequence(moveRangeEnemySpawn, shootEnemySpawn);
export const kiter = new DecisionTree(enemyHasThreats, kiteThreats, moveShootSpawn);

const isSelfHurt = new RelativeHealth(1, less);
const healSelf = new TouchHeal(injuredFriendlies); // TODO: Create self-targeter
const anyAlliesInjured = new FindAny(injuredFriendlies);
const canTouchInjured = new AnyInRange(injuredFriendlies, INTENT_RANGE[HEAL]!);
const touchHeal = new TouchHeal(injuredFriendlies);
const canReachInjured = new AnyInRange(injuredFriendlies, INTENT_RANGE[RANGED_HEAL]!);
const rangedHeal = new RangedHeal(injuredFriendlies);
const moveToWounded = new MoveToNearest(injuredFriendlies, INTENT_RANGE[HEAL], ignoreSwamp);
const allyExists = new FindAny(armedFriendlies);
const followAlly = new MoveToNearest(armedFriendlies, INTENT_RANGE[RANGED_HEAL]);
const goHome = new MoveToNearest(friendlySpawn);
const rangedHealOrMove = new DecisionTree(canReachInjured, rangedHeal, moveToWounded);
const touchOrRangedHeal = new DecisionTree(canTouchInjured, touchHeal, rangedHealOrMove);
const moveToSafety = new DecisionTree(allyExists, followAlly, goHome);
const healOrPosition = new DecisionTree(anyAlliesInjured, touchOrRangedHeal, moveToSafety);
const medic = new DecisionTree(isSelfHurt, healSelf, healOrPosition);

export const roles: Role[] = [
	new Role("raider", new BodyRatio().with(ATTACK).moveEvery(TERRAIN_SWAMP), raider, [[ATTACK, 1]], 0, 33),
	new Role("kiter", new BodyRatio().with(RANGED_ATTACK).moveEvery(TERRAIN_SWAMP), kiter, [[RANGED_ATTACK, 1]], 0, 50),
	new Role("hauler", new BodyRatio().with(CARRY).moveEvery(), hauler, [[CARRY, 1]], 2, 100),
	new Role("builder", new BodyRatio().with(CARRY).with(WORK).moveEvery(), builder, [[BUILD, 1]], 1, 200),
	new Role("medic", new BodyRatio().with(HEAL).moveEvery(TERRAIN_SWAMP), medic, [[HEAL, 1]], 1, 150)
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
// export const haulerFSM = new StateMachine<CreepMind, ScreepsReturnCode>(withdraw, states);
