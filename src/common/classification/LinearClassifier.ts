import { Classifier } from "./Classifier";
import { Classification } from "./Classification";

export abstract class LinearClassifier<instance_t, feature_t, class_t = string>
	implements Classifier<instance_t, class_t>
{
	readonly classifications = new Map<class_t, Map<feature_t, number>>();
	abstract getFeatures(instance: instance_t): Map<feature_t, number>;
	public classify(instance: instance_t): Classification<class_t> {
		const result = new Classification<class_t>();
		const features = this.getFeatures(instance);
		for (const [classification, weights] of this.classifications)
			for (const [feature, weight] of weights) result.set(classification, (features.get(feature) ?? 0) * weight);
		return result;
	}
	public add(
		classification: class_t,
		features: Map<feature_t, number> = new Map<feature_t, number>()
	): Map<feature_t, number> {
		this.classifications.set(classification, features);
		return features;
	}
}
