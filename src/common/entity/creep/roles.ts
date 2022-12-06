import { ActionSequence } from "common/decisions/actions/ActionSequence";
import { DecisionTree } from "common/decisions/DecisionTree";
import { HARVEST, INTENT_RANGE, TRANSFER } from "common/entity/creep/CreepIntent";
import { PATH_COST, ScreepsReturnCode } from "common/Library";
import { ATTACK, RANGED_ATTACK, RESOURCE_ENERGY, TERRAIN_PLAIN } from "game/constants";
import { Creep, GameObject, StructureContainer, StructureSpawn } from "game/prototypes";
import { FindPathOptions } from "game/utils";
import { OwnedGameObject, TEAM_ENEMY } from "../team/Team";
import { AttackLowest } from "./action/AttackLowest";
import { DepositResource } from "./action/DepositResource";
import { FleeThreats } from "./action/FleeThreats";
import { MoveToNearest } from "./action/MoveToNearest";
import { ShootLowest } from "./action/ShootLowest";
import { WithdrawResource } from "./action/WithdrawResource";
import { InRangeOfAny } from "./condition/InRangeOf";
import { IsFull } from "./condition/IsFull";
import { TeamHasAny } from "./TeamHasAny";

const isFull = new IsFull();
// const isEmpty = new IsEmpty(RESOURCE_ENERGY);
const withdrawEnergy = new ActionSequence(
	new MoveToNearest(StructureContainer, INTENT_RANGE[HARVEST], (container => (container.store[RESOURCE_ENERGY] ?? 0) > 0)),
	new WithdrawResource(StructureContainer));
const deliverToSpawn = new ActionSequence(
	new MoveToNearest(StructureSpawn, INTENT_RANGE[TRANSFER], spawn => spawn.my ?? false),
	new DepositResource(StructureSpawn));
export const haulerDecisionTree = new DecisionTree<Creep, ScreepsReturnCode>(isFull, deliverToSpawn, withdrawEnergy);

const canShootThreat = new InRangeOfAny((actor: GameObject) => actor.findInRange(TEAM_ENEMY.FindRole("combat"), INTENT_RANGE[RANGED_ATTACK]!).length > 0);

const isEnemy = (object: OwnedGameObject) => object.my === false;
const isArmed = (creep: Creep) => creep.body.some(({ type, hits }) => type === ATTACK || type === RANGED_ATTACK);
const isThreat = (creep: Creep) => isEnemy(creep) && isArmed(creep);
const isVillager = (creep: Creep) => !isArmed(creep);
const isEnemyVillager = (creep: Creep) => isEnemy(creep) && isVillager(creep);
const ignoreSwamp: FindPathOptions = { swampCost: PATH_COST[TERRAIN_PLAIN] };
const enemyHasCreeps = new TeamHasAny(TEAM_ENEMY, Creep);
const threatInShootingRange = new TeamHasAny(TEAM_ENEMY, Creep,
	(actor: GameObject, enemy: Creep) => actor.getRangeTo(enemy) <= INTENT_RANGE[RANGED_ATTACK]! && isThreat(enemy));
const fleeThreats = new FleeThreats(Creep, INTENT_RANGE[RANGED_ATTACK]!, (actor, threat) => isThreat(threat), ignoreSwamp);
const moveToEnemyVillager = new MoveToNearest(Creep, INTENT_RANGE[ATTACK], isEnemyVillager, ignoreSwamp);
const attackVillager = new AttackLowest(Creep, isEnemyVillager);
const moveToEnemySpawn = new MoveToNearest(StructureSpawn, INTENT_RANGE[ATTACK], isEnemy, ignoreSwamp);
const attackEnemySpawn = new AttackLowest(StructureSpawn, isEnemy);
const moveAttackVillagers = new ActionSequence(moveToEnemyVillager, attackVillager);
const moveAttackSpawn = new ActionSequence(moveToEnemySpawn, attackEnemySpawn);
const attackCreeps = new DecisionTree(threatInShootingRange, fleeThreats, moveAttackVillagers);
export const raider = new DecisionTree(enemyHasCreeps, attackCreeps, moveAttackSpawn);

const threatApproachingMeleeRange = new TeamHasAny(TEAM_ENEMY, Creep,
	(actor: GameObject, enemy: Creep) => actor.getRangeTo(enemy) <= INTENT_RANGE[ATTACK]! + 1 && isThreat(enemy));
const moveToThreat = new MoveToNearest(Creep, INTENT_RANGE[RANGED_ATTACK], isThreat, ignoreSwamp);
const shootLowest = new ShootLowest(Creep, isThreat);
const moveShootThreats = new ActionSequence(moveToThreat, shootLowest);
const kiteThreats = new DecisionTree(threatApproachingMeleeRange, fleeThreats, moveShootThreats);
export const kiter = new DecisionTree(enemyHasCreeps, kiteThreats, moveAttackSpawn);

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
