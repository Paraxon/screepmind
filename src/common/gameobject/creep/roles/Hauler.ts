import { ActionSequence } from "common/decisions/actions/ActionSequence";
import { DecisionTree } from "common/decisions/DecisionTree";
import * as AI from "common/gameobject/Conditions";
import * as Consts from "game/constants";
import * as Proto from "game/prototypes";
import { BoundAction } from "../action/BoundAction";
import * as Intents from "../CreepIntent";
import * as Roles from "common/gameobject/creep/Role";
import { CreepBuilder } from "../CreepBuilder";
import { Idle } from "common/decisions/actions/Idle";
import { ScreepsResult } from "common/gameobject/Result";
import { ActionCombination } from "common/decisions/actions/ActionCombination";

const moveToSpawn = new BoundAction(
	Proto.Creep.prototype.moveTo,
	AI.playerSpawns,
	AI.closest,
	AI.inRangeFor(Intents.Intent.TRANSFER)
);
const moveToEnergy = new BoundAction(
	Proto.Creep.prototype.moveTo,
	AI.playerAccessibleStartingContainers,
	AI.closest,
	AI.inRangeFor(Intents.Intent.WITHDRAW)
);
const withdrawEnergy = new BoundAction(
	Intents.withdrawEnergyAction,
	AI.playerStartingContainers,
	AI.mostEnergy,
	(actor, target) => actor.store.getFreeCapacity() == 0 || target.store.getUsedCapacity() == 0
);
const transferEnergy = new BoundAction(Intents.transferEnergyAction, AI.playerSpawns, AI.closest, AI.isEmpty);
const wait = new Idle<Proto.Creep, ScreepsResult>(Consts.OK);

const getEnergy = new ActionSequence(moveToEnergy, new ActionCombination(withdrawEnergy, moveToSpawn));
const giveEnergy = new ActionCombination(transferEnergy, moveToEnergy);

const spawnFull = (actor: Proto.Creep) => AI.playerSpawns(actor)[0]!.store.getFreeCapacity(Consts.RESOURCE_ENERGY) == 0;
const waitOrTransfer = new DecisionTree(spawnFull, wait, giveEnergy);
const deliverToSpawn = new DecisionTree(AI.canTouchSpawn, waitOrTransfer, moveToSpawn);
const hauler = new DecisionTree(AI.isFullEnergy, deliverToSpawn, getEnergy);
export const haulerRole = new Roles.Role(
	"hauler",
	new CreepBuilder().with(Consts.CARRY).enableMovement(),
	hauler,
	[[Consts.CARRY, 1]],
	1,
	100
);
