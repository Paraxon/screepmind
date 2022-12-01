import { LinearClassifier } from "common/classification/LinearClassifier";
import { Role } from "common/classification/Role";
import { BodyPartConstant } from "game/constants";
import { Creep } from "game/prototypes";

export class CreepClassifier extends LinearClassifier<Creep, BodyPartConstant> {
	getFeatures(creep: Creep): Map<BodyPartConstant, number> {
		return creep.body.reduce(
			(counts, part) => counts.set(part.type, (counts.get(part.type) ?? 0) + 1),
			new Map<BodyPartConstant, number>());
	}
}
