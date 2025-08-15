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
		AI.playerStartingContainers, //TODO: this will break when the containers are behind walls
		AI.mostEnergy,
		AI.inRangeFor(Intents.Intent.WITHDRAW)
	),
	new BoundAction(Intents.withdrawEnergyAction, AI.playerStartingContainers, AI.mostEnergy)
);
const moveToSite = new BoundAction(Proto.Creep.prototype.moveTo, AI.playerSites, AI.closest);
const build = new BoundAction(Proto.Creep.prototype.build, AI.playerSites, AI.mostComplete);
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
