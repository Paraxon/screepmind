import { ActionSequence } from "common/decisions/actions/ActionSequence";
import { DecisionTree } from "common/decisions/DecisionTree";
import { HARVEST, INTENT_RANGE, TRANSFER } from "common/entity/creep/CreepIntent";
import { BinaryPredicate, PATH_COST, Predicate, ScreepsReturnCode } from "common/Library";
import { Targeter } from "common/Targeter";
import { ATTACK, RANGED_ATTACK, RESOURCE_ENERGY, TERRAIN_PLAIN } from "game/constants";
import { Creep, GameObject, StructureContainer, StructureSpawn } from "game/prototypes";
import { FindPathOptions } from "game/utils";
import { OwnedGameObject, TEAM_ENEMY, TEAM_FRIENDLY, TEAM_NEUTRAL } from "../team/Team";
import { AttackLowest } from "./action/AttackLowest";
import { DepositResource } from "./action/DepositResource";
import { FleeThreats } from "./action/FleeThreats";
import { MoveToNearest } from "./action/MoveToNearest";
import { ShootLowest } from "./action/ShootLowest";
import { WithdrawResource } from "./action/WithdrawResource";
import { InRangeOfAny } from "./condition/InRangeOf";
import { IsFull } from "./condition/IsFull";
import { TeamHasAny } from "./TeamHasAny";

const isEnemy: Predicate<GameObject> = (object: OwnedGameObject) => object.my === false;
const isArmed: Predicate<Creep> = (creep: Creep) => creep.body.some(({ type, hits }) => type === ATTACK || type === RANGED_ATTACK);
const isThreat: Predicate<Creep> = (creep: Creep) => isEnemy(creep) && isArmed(creep);
const isVillager: Predicate<Creep> = (creep: Creep) => !isArmed(creep);
const isEnemyVillager: Predicate<Creep> = (creep: Creep) => isEnemy(creep) && isVillager(creep);
const approachingMelee: BinaryPredicate<GameObject, Creep> = (actor: GameObject, target: Creep) => actor.getRangeTo(target) <= INTENT_RANGE[ATTACK]! + 1;
const hasEnergy: Predicate<StructureContainer> = (container: StructureContainer) => container.store[RESOURCE_ENERGY] > 0;

const enemyVillagers = new Targeter(TEAM_ENEMY, Creep, isVillager);
const enemySpawn = new Targeter(TEAM_ENEMY, StructureSpawn, () => true);
const friendlySpawn = new Targeter(TEAM_FRIENDLY, StructureSpawn, () => true);
const threats = new Targeter(TEAM_ENEMY, Creep, isArmed);
const enemyCreeps = new Targeter(TEAM_ENEMY, Creep, () => true);
const energySource = new Targeter(TEAM_NEUTRAL, StructureContainer, hasEnergy);

const withdrawEnergy = new ActionSequence(
	new MoveToNearest(energySource, INTENT_RANGE[HARVEST],),
	new WithdrawResource(StructureContainer));
const deliverToSpawn = new ActionSequence(
	new MoveToNearest(friendlySpawn, INTENT_RANGE[TRANSFER]),
	new DepositResource(StructureSpawn));
export const hauler = new DecisionTree<Creep, ScreepsReturnCode>(new IsFull(), deliverToSpawn, withdrawEnergy);

const ignoreSwamp: FindPathOptions = { swampCost: PATH_COST[TERRAIN_PLAIN] };
const enemyHasCreeps = new TeamHasAny(TEAM_ENEMY, Creep);
const threatInShootingRange = new TeamHasAny(TEAM_ENEMY, Creep,
	(actor: GameObject, enemy: Creep) => actor.getRangeTo(enemy) <= INTENT_RANGE[RANGED_ATTACK]! && isThreat(enemy));
const fleeThreats = new FleeThreats(Creep, INTENT_RANGE[RANGED_ATTACK]!, (actor, threat) => isThreat(threat), ignoreSwamp);
const moveToEnemyVillager = new MoveToNearest(enemyVillagers, INTENT_RANGE[ATTACK], ignoreSwamp);
const attackVillager = new AttackLowest(Creep, isEnemyVillager);
const moveToEnemySpawn = new MoveToNearest(enemySpawn, INTENT_RANGE[ATTACK], ignoreSwamp);
const attackEnemySpawn = new AttackLowest(StructureSpawn, isEnemy);
const moveAttackVillagers = new ActionSequence(moveToEnemyVillager, attackVillager);
const moveAttackSpawn = new ActionSequence(moveToEnemySpawn, attackEnemySpawn);
const attackCreeps = new DecisionTree(threatInShootingRange, fleeThreats, moveAttackVillagers);
export const raider = new DecisionTree(enemyHasCreeps, attackCreeps, moveAttackSpawn);

const enemyHasThreats = new TeamHasAny(TEAM_ENEMY, Creep, (actor, target) => isThreat(target));
const threatApproachingMelee = new TeamHasAny(TEAM_ENEMY, Creep,
	(actor: GameObject, enemy: Creep) => approachingMelee(actor, enemy) && isThreat(enemy));
const moveToThreat = new MoveToNearest(threats, INTENT_RANGE[RANGED_ATTACK], ignoreSwamp);
const shootLowest = new ShootLowest(threats);
const moveShootThreats = new ActionSequence(moveToThreat, shootLowest);
const kiteThreats = new DecisionTree(threatApproachingMelee, fleeThreats, moveShootThreats);
const shootEnemySpawn = new ShootLowest(enemySpawn);
const moveRangeEnemySpawn = new MoveToNearest(enemySpawn, INTENT_RANGE[RANGED_ATTACK], ignoreSwamp);
const moveShootSpawn = new ActionSequence(moveRangeEnemySpawn, shootEnemySpawn);
export const kiter = new DecisionTree(enemyHasThreats, kiteThreats, moveShootSpawn);

// const buildConstructionSite = new ActionSequence(
// 	new MoveToNearest(ConstructionSite, 1, (site: ConstructionSite) => site.progress < site.progressTotal),
// 	new BuildAtSite());
// export const builderDecisionTree = new DecisionTree(isFull, buildConstructionSite, withdrawEnergy);

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
