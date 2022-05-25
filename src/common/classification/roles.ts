import { RESOURCE_ENERGY, ScreepsReturnCode } from "game/constants";
import { StructureContainer, StructureSpawn, Source } from "game/prototypes";
import { ActionSequence } from "../actions/ActionSequence";
import { MoveToNearest, WithdrawResource, DepositResource, HarvestResource } from "../actions/creep/CreepAction";
import { IsFull, IsEmpty } from "../conditions/CreepConditions";
import { CreepMind } from "../decisions/CreepMind";
import { DecisionTree } from "../decisions/DecisionTree";
import { State, Transition, StateMachine } from "../decisions/StateMachine";
import { AdjList } from "../graph/AdjacencyList";

const isFull = new IsFull(RESOURCE_ENERGY);
const isEmpty = new IsEmpty(RESOURCE_ENERGY);
const withdrawEnergy = new ActionSequence(
	new MoveToNearest(StructureContainer, 1, (container: StructureContainer) => container.store.energy > 0),
	new WithdrawResource(StructureContainer));
const deliverEnergy = new ActionSequence(
	new MoveToNearest(StructureSpawn, 1, spawn => spawn.my),
	new DepositResource(StructureSpawn));
const porter = new DecisionTree(isFull, deliverEnergy, withdrawEnergy);

const harvestEnergy = new ActionSequence(
	new MoveToNearest(Source),
	new HarvestResource());
const harvester = new DecisionTree(isFull, deliverEnergy, harvestEnergy);

const withdraw = new State("withdraw", withdrawEnergy);
const deliver = new State("deliver", deliverEnergy);
const states = new AdjList(
	[withdraw, deliver],
	[new Transition(withdraw, deliver, isFull), new Transition(deliver, withdraw, isEmpty)])
const stateMachine = new StateMachine<CreepMind, ScreepsReturnCode>(withdraw, states);