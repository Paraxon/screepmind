export interface Classifier<instance_t, class_t = string> {
	classify(instance: instance_t): Classification<class_t>;
}

export abstract class LinearClassifier<instance_t, feature_t, class_t = string> implements Classifier<instance_t, class_t> {
	private classifications = new Map<class_t, Map<feature_t, number>>();
	abstract getFeatures(instance: instance_t): Map<feature_t, number>;
	public classify(instance: instance_t): Classification<class_t> {
		const result = new Classification<class_t>();
		const features = this.getFeatures(instance);
		for (const [classification, weights] of this.classifications)
			for (const [feature, weight] of weights)
				result.set(classification, (features.get(feature) ?? 0) * weight);
		return result;
	}
	public add(classification: class_t): Map<feature_t, number> {
		const result = new Map<feature_t, number>();
		this.classifications.set(classification, result);
		return result;
	}
}

export class Classification<class_t> {
	private membership = new Map<class_t, number>();
	public get best(): class_t | undefined {
		return Array.from(this.membership.entries()).reduce((a, b) => a[1] > b[1] ? a : b)[0];
	}
	public set(classification: class_t, membership: number) {
		this.membership.set(classification, membership);
	}
}