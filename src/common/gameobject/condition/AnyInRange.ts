import { Condition } from "common/decisions/Condition";
import { Distance } from "common/library";
import { Targeter } from "common/gameobject/Targeter";
import { GameObject } from "game/prototypes";

export class AnyInRange<target_t extends GameObject> implements Condition<GameObject> {
	private readonly targeter: Targeter<target_t>;
	private readonly radius: Distance;
	public constructor(targeter: Targeter<target_t>, radius: Distance) {
		this.targeter = targeter;
		this.radius = radius;
	}
	evaluate(actor: GameObject): boolean {
		return this.targeter.all().some(target => actor.getRangeTo(target) <= this.radius);
	}
}