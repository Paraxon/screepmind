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

const moveToObstacle = new BoundAction(
	Proto.Creep.prototype.moveTo,
	actor => AI.getClosestObstacle(actor),
	(actor, target) => AI.inAttackRange(actor, target)
);
const destroyObstacle = new BoundAction(Proto.Creep.prototype.attack, actor => AI.getClosestObstacle(actor));
const clearPath = new ActionSequence(moveToObstacle, destroyObstacle);

const ignoreSwamp: Utils.FindPathOptions = { swampCost: Lib.PATH_COST[Consts.TERRAIN_PLAIN] };
const fleeThreats = new NavAction(
	actor => AI.threats().filter(target => actor.getRangeTo(target) < Intents.RANGE[Intents.Intent.RANGED_ATTACK]!),
	{ ...ignoreSwamp, flee: true }
);
const moveToEnemyVillager = new BoundAction(
	Proto.Creep.prototype.moveTo,
	(actor: Proto.Creep) => AI.enemyVillagers().reduce(AI.closestTo(actor)),
	(actor, target) => AI.inAttackRange(actor, target)
);
const attackVillager = new BoundAction(Proto.Creep.prototype.attack, (actor: Proto.Creep) =>
	Utils.getObjectsByPrototype(Proto.Creep)
		.filter(AI.isThreat)
		.filter(creep => AI.inAttackRange(actor, creep))
		.reduce(AI.leastHealthCreep)
);
const moveToEnemySpawn = new BoundAction(
	Proto.Creep.prototype.moveTo,
	actor => AI.enemySpawns().reduce(AI.closestTo(actor)),
	(actor, target) => AI.inAttackRange(actor, target)
);
const attackEnemySpawn = new BoundAction(Proto.Creep.prototype.attack, actor =>
	Utils.getObjectsByPrototype(Proto.StructureSpawn)
		.filter(AI.isEnemy)
		.filter(spawn => AI.inAttackRange(actor, spawn))
		.reduce(AI.leastHealthSpawn)
);
const moveAttackVillagers = new ActionSequence(moveToEnemyVillager, attackVillager);
const moveAttackSpawn = new ActionSequence(moveToEnemySpawn, attackEnemySpawn);
const bullyVillagers = new DecisionTree(AI.threatInShootingRange, fleeThreats, moveAttackVillagers);
const raid = new DecisionTree(AI.enemyHasCreeps, bullyVillagers, moveAttackSpawn);
const raider = new DecisionTree(actor => !!AI.getClosestObstacle(actor), clearPath, raid);

const raiderRole = new Roles.Role(
	"raider",
	new CreepBuilder().with(Consts.ATTACK).enableMovement(Consts.TERRAIN_SWAMP),
	raider,
	[[Consts.ATTACK, 1]],
	1,
	33
);
Roles.roles.push(raiderRole);
Roles.classifier.add(raiderRole, raiderRole.features);
