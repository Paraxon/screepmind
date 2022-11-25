import { Classification } from "./Classification";

export interface Classifier<instance_t, class_t = string> {
	classify(instance: instance_t): Classification<class_t>;
}
