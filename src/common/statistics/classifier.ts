import { BodyPartConstant } from "game/constants";
import { Creep } from "game/prototypes";

export interface Classifier<instance_t, classification_t = string> {
    classify(instance: instance_t): Map<classification_t, number>;
}

export class ScreepClassifier implements Classifier<Creep> {
    classifications = new Map<string, Map<BodyPartConstant, number>>();
    classify(creep: Creep): Map<string, number> {
        const result = new Map<string, number>();
        const features = new Map<BodyPartConstant, number>();
        creep.body.forEach(part => features.set(part.type, features.get(part.type) || 0 + 1));
        for (const [classification, weights] of this.classifications)
            for (const [feature, weight] of weights)
                result.set(classification, features.get(feature) || 0 * weight);
        return result;
    }
}
