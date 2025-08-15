import { ActionSequence } from "common/decisions/actions/ActionSequence";
import { DecisionTree } from "common/decisions/DecisionTree";
import * as AI from "common/gameobject/Conditions";
import * as Consts from "game/constants";
import * as Proto from "game/prototypes";
import * as Utils from "game/utils";
import { BoundAction } from "../action/BoundAction";
import * as Intents from "../CreepIntent";
import { NavAction } from "../action/NavAction";
import * as Lib from "common/library";
import * as Roles from "common/gameobject/creep/Role";
import { CreepBuilder } from "../CreepBuilder";
import { ActionCombination } from "common/decisions/actions/ActionCombination";

const threatNearTouch = AI.anyInRange(AI.enemyMelee, 3);
const ignoreSwamp: Utils.FindPathOptions = { swampCost: Lib.PATH_COST[Consts.TERRAIN_PLAIN] };
const shootLowest = new BoundAction(Proto.Creep.prototype.rangedAttack, AI.enemyCreeps, AI.leastHealth);
const fleeThreats = new NavAction(
	actor => AI.enemyArmed().filter(target => actor.getRangeTo(target) < Intents.RANGE[Intents.Intent.RANGED_ATTACK]!),
	{ ...ignoreSwamp, flee: true }
);
const fightingRetreat = new ActionCombination(fleeThreats, shootLowest);
const chase = new BoundAction(
	Proto.Creep.prototype.moveTo,
	_actor => AI.enemyArmed(),
	AI.closest,
	AI.inRangeFor(Intents.Intent.RANGED_ATTACK)
);
const moveShootThreats = new ActionCombination(chase, shootLowest);
const kiteThreats = new DecisionTree(threatNearTouch, fightingRetreat, moveShootThreats);

const moveToEnemySpawn = new BoundAction(
	Proto.Creep.prototype.moveTo,
	actor => AI.opponentSpawns(actor),
	AI.closest,
	AI.inRangeFor(Intents.Intent.RANGED_ATTACK)
);
const shootSpawn = new BoundAction(Proto.Creep.prototype.rangedAttack, AI.opponentSpawns, AI.leastHealth);
const driveBy = new ActionSequence(shootSpawn, shootLowest);

const moveShootSpawn = new ActionCombination(moveToEnemySpawn, driveBy);
const kiterTree = new DecisionTree(AI.enemyHasThreats, kiteThreats, moveShootSpawn);

export const kiterRole = new Roles.Role(
	"kiter",
	new CreepBuilder().with(Consts.RANGED_ATTACK).enableMovement(Consts.TERRAIN_SWAMP),
	kiterTree,
	[[Consts.RANGED_ATTACK, 1]],
	0,
	50
);
