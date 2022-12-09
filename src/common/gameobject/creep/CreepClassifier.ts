import { LinearClassifier } from "common/classification/LinearClassifier";
import { Role } from "common/classification/Role";
import { BodyPartType, Creep } from "game/prototypes";

export class CreepClassifier extends LinearClassifier<Creep, BodyPartType> {
	getFeatures(creep: Creep): Map<BodyPartType, number> {
		return creep.body.reduce(
			(counts, part) => counts.set(part.type, (counts.get(part.type) ?? 0) + 1),
			new Map<BodyPartType, number>());
	}
}
