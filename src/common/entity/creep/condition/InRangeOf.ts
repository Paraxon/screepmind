import { Condition } from "common/decisions/Condition";
import { Distance } from "common/Library";
import { Targeter } from "common/Targeter";
import { Creep, GameObject } from "game/prototypes";

export class InRangeOfAny implements Condition<GameObject>{
	private readonly targeter: Targeter;
	private readonly radius: Distance;
	public constructor(targeter: Targeter, radius: Distance) {
		this.targeter = targeter;
		this.radius = radius;
	}
	evaluate(actor: GameObject): boolean {
		return actor.findInRange(this.targeter.select(), this.radius).length > 0;
	}
}