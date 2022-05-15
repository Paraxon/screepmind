import { DecisionMaker } from "common/decisions/DecisionMaker";
import { BodyPartConstant, ScreepsReturnCode } from "game/constants";
import { Creep } from "game/prototypes";

export interface Classifier<instance_t, classification_t = string> {
	classify(instance: instance_t): ClassificationResult<classification_t>;
}

export class Role {
	public readonly name: string;
	public readonly ai?: DecisionMaker<Creep, ScreepsReturnCode>;
	public constructor(name: string, ai?: DecisionMaker<Creep, ScreepsReturnCode>) {
		this.name = name;
		this.ai = ai;
	}
}

export class ClassificationResult<classification_t> {
	public membership = new Map<classification_t, number>();
	public get best(): classification_t | undefined {
		return Array.from(this.membership.entries())
			.filter(membership => membership[1] > 0)
			.reduce((a, b) => a[1] > b[1] ? a : b)[0];
	}
	public set(classification: classification_t, membership: number) {
		this.membership.set(classification, membership);
	}
}

export class CreepClassifier implements Classifier<Creep, Role> {
	public classifications = new Map<Role, Map<BodyPartConstant, number>>();
	public classify(creep: Creep): ClassificationResult<Role> {
		const result = new ClassificationResult<Role>();
		const features = creep.body.reduce(
			(acc, part) => acc.set(part.type, (acc.get(part.type) ?? 0) + 1),
			new Map<BodyPartConstant, number>());
		for (const [classification, weights] of this.classifications)
			for (const [feature, weight] of weights)
				result.set(classification, (features.get(feature) ?? 0) * weight);
		return result;
	}
}
