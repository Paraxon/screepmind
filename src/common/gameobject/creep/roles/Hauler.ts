import { ActionSequence } from "common/decisions/actions/ActionSequence";
import { DecisionTree } from "common/decisions/DecisionTree";
import * as AI from "common/gameobject/Conditions";
import * as Consts from "game/constants";
import * as Proto from "game/prototypes";
import { BoundAction } from "../action/BoundAction";
import * as Intents from "../CreepIntent";
import * as Roles from "common/gameobject/creep/Role";
import { CreepBuilder } from "../CreepBuilder";

const withdrawEnergy = new ActionSequence(
	new BoundAction(
		Proto.Creep.prototype.moveTo,
		AI.playerStartingContainers,
		AI.closest,
		AI.inRangeFor(Intents.Intent.WITHDRAW)
	),
	new BoundAction(
		Intents.withdrawEnergyAction,
		AI.playerStartingContainers,
		AI.mostEnergy,
		(actor, target) => actor.store.getFreeCapacity() == 0 || target.store.getUsedCapacity() == 0
	)
);
const deliverToSpawn = new ActionSequence(
	new BoundAction(Proto.Creep.prototype.moveTo, AI.playerSpawns, AI.closest, AI.inRangeFor(Intents.Intent.WITHDRAW)),
	new BoundAction(Intents.transferEnergyAction, AI.playerSpawns, AI.closest, AI.isEmpty)
);
const hauler = new DecisionTree(AI.isFullEnergy, deliverToSpawn, withdrawEnergy);
export const haulerRole = new Roles.Role(
	"hauler",
	new CreepBuilder().with(Consts.CARRY).enableMovement(),
	hauler,
	[[Consts.CARRY, 1]],
	1,
	100
);
