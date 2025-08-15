import { DecisionTree } from "common/decisions/DecisionTree";
import * as AI from "common/gameobject/Conditions";
import * as Proto from "game/prototypes";
import { BoundAction } from "../action/BoundAction";
import { Role } from "common/gameobject/creep/Role";
import { CreepBuilder } from "../CreepBuilder";
import * as Consts from "game/constants";
import * as Intents from "../CreepIntent";

const healSelf = new BoundAction(Proto.Creep.prototype.heal, actor => [actor], undefined, AI.isUnhurt);
const touchHeal = new BoundAction(Proto.Creep.prototype.heal, AI.hurtAllies, AI.leastHealth);
const rangedHeal = new BoundAction(Proto.Creep.prototype.rangedHeal, AI.hurtAllies, AI.leastHealth);
const moveToWounded = new BoundAction(Proto.Creep.prototype.moveTo, AI.hurtAllies, AI.closest, (actor, target) =>
	AI.inRangedHealRange(actor, target)
);

const followAlly = new BoundAction(Proto.Creep.prototype.moveTo, AI.armedFriendlies, AI.closest, (actor, target) =>
	AI.inRangedHealRange(actor, target)
);
const goHome = new BoundAction(Proto.Creep.prototype.moveTo, AI.playerSpawns, undefined, (actor, target) =>
	AI.inRangedHealRange(actor, target)
);
const rangedHealOrMove = new DecisionTree(AI.canReachInjured, rangedHeal, moveToWounded);
const touchOrRangedHeal = new DecisionTree(AI.canTouchInjured, touchHeal, rangedHealOrMove);
const moveToSafety = new DecisionTree(AI.allyExists, followAlly, goHome);
const healOrPosition = new DecisionTree(AI.anyAlliesInjured, touchOrRangedHeal, moveToSafety);
const medic = new DecisionTree(AI.isHurt, healSelf, healOrPosition);

export const medicRole = new Role(
	"medic",
	new CreepBuilder().with(Consts.HEAL).enableMovement(Consts.TERRAIN_SWAMP),
	medic,
	[[Intents.Intent.HEAL, 1]],
	0,
	150
);
