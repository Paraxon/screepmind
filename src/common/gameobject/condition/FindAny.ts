import { Condition } from "common/decisions/Condition";
import { Targeter } from "common/gameobject/Targeter";
import { GameObject } from "game/prototypes";

export class FindAny<object_t extends GameObject> implements Condition<GameObject> {
	private readonly targeter: Targeter<object_t>;
	public constructor(targeter: Targeter<object_t>) {
		this.targeter = targeter;
	}
	evaluate(actor: GameObject): boolean {
		return this.targeter.all().length > 0;
	}
}