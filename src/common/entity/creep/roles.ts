import { RESOURCE_ENERGY, ScreepsReturnCode } from "game/constants";
import { StructureContainer, StructureSpawn, Source, ConstructionSite } from "game/prototypes";
import { ActionSequence } from "../decisions/actions/ActionSequence";
import { MoveToNearest, WithdrawResource, DepositResource, HarvestResource, BuildAtSite } from "./CreepAction";
import { IsFull, IsEmpty } from "../decisions/conditions/CreepConditions";
import { CreepMind } from "../decisions/CreepMind";
import { DecisionTree } from "../decisions/DecisionTree";
import { State, Transition, StateMachine } from "../decisions/StateMachine";
import { AdjList } from "../graph/AdjacencyList";

const isFull = new IsFull(RESOURCE_ENERGY);
const isEmpty = new IsEmpty(RESOURCE_ENERGY);
const withdrawEnergy = new ActionSequence(
	new MoveToNearest(StructureContainer, 1, (container: StructureContainer) => container.store.energy > 0),
	new WithdrawResource(StructureContainer));
const deliverToSpawn = new ActionSequence(
	new MoveToNearest(StructureSpawn, 1, spawn => spawn.my),
	new DepositResource(StructureSpawn));
export const haulerDecisionTree = new DecisionTree(isFull, deliverToSpawn, withdrawEnergy);

const buildConstructionSite = new ActionSequence(
	new MoveToNearest(ConstructionSite, 1, (site: ConstructionSite) => site.progress < site.progressTotal),
	new BuildAtSite());
export const builderDecisionTree = new DecisionTree(isFull, buildConstructionSite, withdrawEnergy);

const harvestEnergy = new ActionSequence(
	new MoveToNearest(Source),
	new HarvestResource());
export const harvesterDecisionTree = new DecisionTree(isFull, deliverToSpawn, harvestEnergy);

const withdraw = new State("withdraw", withdrawEnergy);
const deliver = new State("deliver", deliverToSpawn);
const states = new AdjList(
	[withdraw, deliver],
	[new Transition(withdraw, deliver, isFull), new Transition(deliver, withdraw, isEmpty)])
export const haulerFSM = new StateMachine<CreepMind, ScreepsReturnCode>(withdraw, states);
