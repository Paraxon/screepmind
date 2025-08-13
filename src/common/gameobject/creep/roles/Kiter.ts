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

const enemyHasThreats = AI.exists(() => Utils.getObjectsByPrototype(Proto.Creep).filter(AI.isEnemy));
const threatApproachingMelee = AI.inRange(
	() => Utils.getObjectsByPrototype(Proto.Creep).filter(AI.isEnemy),
	Intents.RANGE[Intents.Intent.ATTACK]! + 1
);
const moveToThreat = new BoundAction(
	Proto.Creep.prototype.moveTo,
	actor => AI.threats().reduce(AI.closestTo(actor)),
	(actor, target) => AI.inRangedAttackRange(actor, target)
);
const shootLowest = new BoundAction(Proto.Creep.prototype.rangedAttack, actor =>
	Utils.getObjectsByPrototype(Proto.Creep).filter(AI.isEnemy).reduce(AI.leastHealthCreep)
);
const ignoreSwamp: Utils.FindPathOptions = { swampCost: Lib.PATH_COST[Consts.TERRAIN_PLAIN] };
const fleeThreats = new NavAction(
	actor => AI.threats().filter(target => actor.getRangeTo(target) < Intents.RANGE[Intents.Intent.RANGED_ATTACK]!),
	{ ...ignoreSwamp, flee: true }
);
const moveShootThreats = new ActionSequence(moveToThreat, shootLowest);
const kiteThreats = new DecisionTree(threatApproachingMelee, fleeThreats, moveShootThreats);
const shootEnemySpawn = new BoundAction(Proto.Creep.prototype.rangedAttack, actor =>
	Utils.getObjectsByPrototype(Proto.StructureSpawn).filter(AI.isEnemy).reduce(AI.leastHealthSpawn)
);
const moveRangeEnemySpawn = new BoundAction(
	Proto.Creep.prototype.moveTo,
	actor => AI.enemySpawns().reduce(AI.closestTo(actor)),
	(actor, target) => AI.inRangedAttackRange(actor, target)
);
const moveShootSpawn = new ActionSequence(moveRangeEnemySpawn, shootEnemySpawn);
export const kiter = new DecisionTree(enemyHasThreats, kiteThreats, moveShootSpawn);

const kiterRole = new Roles.Role(
	"kiter",
	new CreepBuilder().with(Consts.RANGED_ATTACK).enableMovement(Consts.TERRAIN_SWAMP),
	kiter,
	[[Consts.RANGED_ATTACK, 1]],
	0,
	50
);
Roles.roles.push(kiterRole);
Roles.classifier.add(kiterRole, kiterRole.features);
