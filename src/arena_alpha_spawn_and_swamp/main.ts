import { ScreepClassifier } from "common/statistics/classifier";
import { getObjectsByPrototype } from "game";
import { ATTACK, BodyPartConstant, CARRY, HEAL, MOVE, RANGED_ATTACK, WORK } from "game/constants";
import { Creep } from "game/prototypes";
import * as Actions from "common/decisions/action";

const classifier = new ScreepClassifier();
classifier.classifications.set("archer", new Map().set(RANGED_ATTACK, 1));
classifier.classifications.set("harvester", new Map<BodyPartConstant, number>().set(WORK, 1));
classifier.classifications.set("melee", new Map<BodyPartConstant, number>().set(ATTACK, 1));
classifier.classifications.set("support", new Map<BodyPartConstant, number>().set(HEAL, 1));

export function loop() {
	console.log(Actions.CreepAction.canDoBoth(new Actions.Harvest(), new Actions.Attack()));
	console.log(Actions.CreepAction.canDoBoth(new Actions.Attack(), new Actions.RangedAttack()));
	console.log(Actions.CreepAction.comparePriority(new Actions.Harvest(), new Actions.Attack()));
	console.log(Actions.CreepAction.comparePriority(new Actions.Attack(), new Actions.Harvest()));
	console.log(Actions.CreepAction.comparePriority(new Actions.Harvest(), new Actions.Move()));
}
