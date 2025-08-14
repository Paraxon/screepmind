import { ActionSequence } from "common/decisions/actions/ActionSequence";
import { DecisionTree } from "common/decisions/DecisionTree";
import * as AI from "common/gameobject/Conditions";
import * as Consts from "game/constants";
import * as Proto from "game/prototypes";
import * as Utils from "game/utils";
import { BoundAction } from "../action/BoundAction";
import * as Intents from "../CreepIntent";
import * as Roles from "common/gameobject/creep/Role";
import { CreepBuilder } from "../CreepBuilder";
import * as Func from "common/Functional";

const withdrawEnergy = new ActionSequence(
	new BoundAction(
		Proto.Creep.prototype.moveTo,
		actor =>
			Utils.findClosestByPath(
				Utils.getObjectsByPrototype(Proto.StructureSpawn).find(AI.isPlayer)!,
				Utils.getObjectsByPrototype(Proto.StructureContainer).filter(AI.hasEnergy),
				{ ignore: [actor] }
			),
		AI.inRangeFor(Intents.Intent.WITHDRAW)
	),
	new BoundAction(
		Intents.withdrawEnergyAction,
		actor =>
			Utils.getObjectsByPrototype(Proto.StructureContainer)
				.filter(container => AI.inWithdrawRange(actor, container))
				.reduce(AI.mostEnergy),
		AI.resourceCompare(Func.greater)
	)
);
const deliverToSpawn = new ActionSequence(
	new BoundAction(
		Proto.Creep.prototype.moveTo,
		actor => AI.friendlySpawns().reduce(AI.closestTo(actor)),
		AI.inRangeFor(Intents.Intent.WITHDRAW)
	),
	new BoundAction(Intents.transferEnergyAction, actor => AI.friendlySpawns().reduce(AI.closestTo(actor)), AI.isEmpty)
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
