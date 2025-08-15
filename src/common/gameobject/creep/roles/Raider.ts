import { ActionSequence } from "common/decisions/actions/ActionSequence";
import { DecisionTree } from "common/decisions/DecisionTree";
import * as AI from "common/gameobject/Conditions";
import * as Consts from "game/constants";
import * as Proto from "game/prototypes";
import { BoundAction } from "../action/BoundAction";
import * as Roles from "common/gameobject/creep/Role";
import { CreepBuilder } from "../CreepBuilder";

const moveToObstacle = new BoundAction(
	Proto.Creep.prototype.moveTo,
	AI.playerStartingObstacles,
	AI.closest,
	(actor, target) => AI.inAttackRange(actor, target)
);
const destroyObstacle = new BoundAction(Proto.Creep.prototype.attack, AI.playerStartingObstacles, AI.closest);
const clearPath = new ActionSequence(moveToObstacle, destroyObstacle);

// const ignoreSwamp: Utils.FindPathOptions = { swampCost: Lib.PATH_COST[Consts.TERRAIN_PLAIN] };

const moveToEnemyCreep = new BoundAction(Proto.Creep.prototype.moveTo, AI.enemyCreeps, AI.closest, (actor, target) =>
	AI.inAttackRange(actor, target)
);
const attackCreep = new BoundAction(Proto.Creep.prototype.attack, AI.enemyCreeps, AI.leastHealth);
const moveToEnemySpawn = new BoundAction(Proto.Creep.prototype.moveTo, AI.opponentSpawns, AI.closest, (actor, target) =>
	AI.inAttackRange(actor, target)
);
const attackEnemySpawn = new BoundAction(Proto.Creep.prototype.attack, AI.opponentSpawns);
const moveAttackCreeps = new ActionSequence(moveToEnemyCreep, attackCreep);
const moveAttackSpawn = new ActionSequence(moveToEnemySpawn, attackEnemySpawn);
// const bullyCreeps = new DecisionTree(AI.threatInShootingRange, fleeThreats, moveAttackCreeps);
const attack = new DecisionTree(AI.enemyHasCreeps, moveAttackCreeps, moveAttackSpawn);
const raiderTree = new DecisionTree(actor => AI.playerStartingObstacles(actor).length > 0, clearPath, attack);

export const raiderRole = new Roles.Role(
	"raider",
	new CreepBuilder().with(Consts.ATTACK).enableMovement(Consts.TERRAIN_SWAMP),
	raiderTree,
	[[Consts.ATTACK, 1]],
	1,
	33
);
