import { DecisionTree } from "common/decisions/DecisionTree";
import * as AI from "common/gameobject/Conditions";
import * as Proto from "game/prototypes";
import * as Utils from "game/utils";
import { BoundAction } from "../action/BoundAction";
import * as Roles from "common/gameobject/creep/Role";
import { CreepBuilder } from "../CreepBuilder";
import * as Consts from "game/constants";
import * as Intents from "../CreepIntent";

const healSelf = new BoundAction(
	Proto.Creep.prototype.heal,
	actor => actor,
	(actor, target) => actor.hits >= actor.hitsMax
);

const touchHeal = new BoundAction(Proto.Creep.prototype.heal, actor =>
	Utils.getObjectsByPrototype(Proto.Creep)
		.filter(AI.isAlly)
		.filter(creep => AI.inHealRange(actor, creep))
		.reduce(AI.leastHealthCreep)
);

const rangedHeal = new BoundAction(Proto.Creep.prototype.rangedHeal, actor =>
	Utils.getObjectsByPrototype(Proto.Creep)
		.filter(AI.isAlly)
		.filter(AI.isHurt)
		.filter(creep => AI.inRangedHealRange(actor, creep))
		.reduce(AI.leastHealthCreep)
);
const moveToWounded = new BoundAction(
	Proto.Creep.prototype.moveTo,
	actor => AI.injuredFriendlies().reduce(AI.closestTo(actor)),
	(actor, target) => AI.inRangedHealRange(actor, target)
);

const followAlly = new BoundAction(
	Proto.Creep.prototype.moveTo,
	actor => AI.armedFriendlies().reduce(AI.closestTo(actor)),
	(actor, target) => AI.inRangedHealRange(actor, target)
);
const goHome = new BoundAction(
	Proto.Creep.prototype.moveTo,
	actor => AI.friendlySpawns().reduce(AI.closestTo(actor)),
	(actor, target) => AI.inRangedHealRange(actor, target)
);
const rangedHealOrMove = new DecisionTree(AI.canReachInjured, rangedHeal, moveToWounded);
const touchOrRangedHeal = new DecisionTree(AI.canTouchInjured, touchHeal, rangedHealOrMove);
const moveToSafety = new DecisionTree(AI.allyExists, followAlly, goHome);
const healOrPosition = new DecisionTree(AI.anyAlliesInjured, touchOrRangedHeal, moveToSafety);
const medic = new DecisionTree(AI.isSelfHurt, healSelf, healOrPosition);

const medicRole = new Roles.Role(
	"medic",
	new CreepBuilder().with(Consts.HEAL).enableMovement(Consts.TERRAIN_SWAMP),
	medic,
	[[Intents.Intent.HEAL, 1]],
	0,
	150
);
console.log("pushing medic role");
Roles.roles.push(medicRole);
Roles.classifier.add(medicRole, medicRole.features);
