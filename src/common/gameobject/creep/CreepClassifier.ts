import { LinearClassifier } from "common/classification/LinearClassifier";
import { BodyPartType, Creep } from "game/prototypes";

export class CreepClassifier<classification_t> extends LinearClassifier<Creep, BodyPartType, classification_t> {
	getFeatures(creep: Creep): Map<BodyPartType, number> {
		return creep.body.reduce(
			(counts, part) => counts.set(part.type, (counts.get(part.type) ?? 0) + 1),
			new Map<BodyPartType, number>());
	}
}
