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

const withdrawEnergy = new ActionSequence(
	new BoundAction(
		Proto.Creep.prototype.moveTo,
		actor =>
			Utils.findClosestByPath(
				Utils.getObjectsByPrototype(Proto.StructureSpawn).find(AI.isAlly)!,
				Utils.getObjectsByPrototype(Proto.StructureContainer).filter(AI.hasEnergy),
				{ ignore: [actor] }
			),
		(actor, target) => AI.inWithdrawRange(actor, target)
	),
	new BoundAction(
		Intents.withdrawEnergyAction,
		actor =>
			Utils.getObjectsByPrototype(Proto.StructureContainer)
				.filter(container => AI.inWithdrawRange(actor, container))
				.reduce(AI.mostEnergy),
		(actor, target) =>
			actor.store.getUsedCapacity(Consts.RESOURCE_ENERGY)! > target.store.getUsedCapacity(Consts.RESOURCE_ENERGY)!
	)
);
const moveToSite = new BoundAction(
	Proto.Creep.prototype.moveTo,
	actor => AI.friendlySites().reduce(AI.closestTo(actor)),
	(actor, target) => AI.inBuildRange(actor, target)
);
const build = new BoundAction(Proto.Creep.prototype.build, actor =>
	Utils.getObjectsByPrototype(Proto.ConstructionSite)
		.filter(AI.isAlly)
		.filter(target => AI.inBuildRange(actor, target))
		.reduce(AI.mostComplete)
);
const moveBuild = new ActionSequence(moveToSite, build);
const builder = new DecisionTree(AI.isFullEnergy, moveBuild, withdrawEnergy);
export const builderRole = new Roles.Role(
	"builder",
	new CreepBuilder().with(Consts.CARRY).with(Consts.WORK).enableMovement(),
	builder,
	[[Intents.Intent.BUILD, 1]],
	0,
	200
);
