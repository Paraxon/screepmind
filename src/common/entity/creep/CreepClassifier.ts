import { BodyPartConstant } from "game/constants";
import { Creep } from "game/prototypes";
import { LinearClassifier } from "../classification/Classifier";
import { Role } from "../classification/Role";

export class CreepClassifier extends LinearClassifier<Creep, BodyPartConstant, Role> {
	getFeatures(creep: Creep): Map<BodyPartConstant, number> {
		return creep.body.reduce(
			(counts, part) => counts.set(part.type, (counts.get(part.type) ?? 0) + 1),
			new Map<BodyPartConstant, number>());
	}
}
