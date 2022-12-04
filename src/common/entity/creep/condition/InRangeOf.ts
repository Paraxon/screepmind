import { Condition } from "common/decisions/Condition";
import { Creep, GameObject } from "game/prototypes";

export class InRangeOfAny implements Condition<GameObject>{
	private predicate: (actor: GameObject) => boolean;
	public constructor(predicate: (actor: GameObject) => boolean) {
		this.predicate = predicate;
	}
	evaluate(actor: GameObject): boolean {
		return this.predicate(actor);
	}
}