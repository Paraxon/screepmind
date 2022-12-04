import { ActionSequence } from "common/decisions/actions/ActionSequence";
import { DecisionTree } from "common/decisions/DecisionTree";
import { ScreepsReturnCode } from "common/Library";
import { INTENT_RANGE } from "common/entity/creep/CreepIntent";
import { RANGED_ATTACK, RESOURCE_ENERGY } from "game/constants";
import { Creep, GameObject, StructureContainer, StructureSpawn } from "game/prototypes";
import { TEAM_ENEMY } from "../team/Team";
import { DepositResource } from "./action/DepositResource";
import { MoveToNearest } from "./action/MoveToNearest";
import { WithdrawResource } from "./action/WithdrawResource";
import { InRangeOfAny } from "./condition/InRangeOf";
import { IsFull } from "./condition/IsFull";

const isFull = new IsFull();
// const isEmpty = new IsEmpty(RESOURCE_ENERGY);
const withdrawEnergy = new ActionSequence(
	new MoveToNearest(StructureContainer, 1, (container => (container.store[RESOURCE_ENERGY] ?? 0) > 0)),
	new WithdrawResource(StructureContainer));
const deliverToSpawn = new ActionSequence(
	new MoveToNearest(StructureSpawn, 1, spawn => spawn.my ?? false),
	new DepositResource(StructureSpawn));
export const haulerDecisionTree = new DecisionTree<Creep, ScreepsReturnCode>(isFull, deliverToSpawn, withdrawEnergy);

const canShoot = new InRangeOfAny((actor: GameObject) => actor.findInRange(TEAM_ENEMY.Creeps, INTENT_RANGE[RANGED_ATTACK]!).length > 0);

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
