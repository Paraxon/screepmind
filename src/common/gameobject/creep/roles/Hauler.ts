import { ActionCombination } from "common/decisions/actions/ActionCombination";
import { ActionSequence } from "common/decisions/actions/ActionSequence";
import { Idle } from "common/decisions/actions/Idle";
import { DecisionTree } from "common/decisions/DecisionTree";
import * as AI from "common/gameobject/Conditions";
import * as Roles from "common/gameobject/creep/Role";
import { ScreepsResult } from "common/gameobject/Result";
import * as Consts from "game/constants";
import * as Proto from "game/prototypes";
import { BoundAction } from "../action/BoundAction";
import { CreepBuilder } from "../CreepBuilder";
import * as Intents from "../CreepIntent";
import { NavAction } from "../action/NavAction";
import { CreepWrapper } from "../CreepWrapper";

// Threat nearby?
// 		Y: Flee Threats
//		N: Has Energy?
// 			Y: Touching any bank?
// 				Y: Bank Full?
// 					Y: Wait
// 					N: Transfer to Bank, Move to nearest neutral Container with energy
// 				N: Move to nearest not full bank, transfer energy
//			N: Can reach any neutral container with energy before it decays?
// 				Y: Move to Container, Withdraw
// 				N: Wait

const flee = new NavAction(AI.enemyArmed, { flee: true });
const moveToBank = new BoundAction(
	Proto.Creep.prototype.moveTo,
	AI.alliedBanks,
	AI.closest,
	AI.inRangeFor(Intents.Intent.TRANSFER)
);
const moveToEnergy = new BoundAction(
	Proto.Creep.prototype.moveTo,
	AI.accessibleNeutralContainersWithEnergy,
	AI.closest,
	AI.inRangeFor(Intents.Intent.WITHDRAW)
);
const withdrawEnergy = new BoundAction(
	Intents.withdrawEnergyAction,
	AI.accessibleNeutralContainersWithEnergy,
	AI.mostEnergy,
	(actor, target) => actor.store.getFreeCapacity() == 0 || target.store.getUsedCapacity() == 0
);
const transferEnergy = new BoundAction(Intents.transferEnergyAction, AI.alliedBanks, AI.closest, AI.isEmpty);
const wait = new Idle<Proto.Creep, ScreepsResult>(Consts.OK);

const getEnergy = new ActionSequence(moveToEnergy, new ActionCombination(withdrawEnergy, moveToBank));
const giveEnergy = new ActionCombination(transferEnergy, moveToEnergy);

const touchingAlliedBank = AI.anyInRange(AI.alliedBanks, 1);
const destinationFull = (actor: Proto.Creep) => AI.alliedBanks(actor).some(AI.isFullEnergy);
const canReachAnyContainerBeforeDecay = (actor: Proto.Creep) =>
	AI.accessibleNeutralContainersWithEnergy(actor).some(container =>
		new CreepWrapper(actor).canReachBeforeDecay(container)
	);
const threatApproaching = AI.anyInRange(AI.enemyMelee, 3);

const waitOrTransfer = new DecisionTree(destinationFull, wait, giveEnergy);
const travelOrWait = new DecisionTree(canReachAnyContainerBeforeDecay, getEnergy, wait);
const deliverToBank = new DecisionTree(touchingAlliedBank, waitOrTransfer, moveToBank);
const haulEnergy = new DecisionTree(AI.isFullEnergy, deliverToBank, travelOrWait);
const fleeOrHaul = new DecisionTree(threatApproaching, flee, haulEnergy);

export const haulerRole = new Roles.Role(
	"hauler",
	new CreepBuilder().with(Consts.CARRY).enableMovement(),
	fleeOrHaul,
	[[Consts.CARRY, 1]],
	1,
	100
);
