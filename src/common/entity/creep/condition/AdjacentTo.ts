import { GameObject, Id } from "game/prototypes";
import { getObjectById } from "game/utils";
import { Condition } from "../../../decisions/Condition";


export class AdjacentTo implements Condition<GameObject> {
	private id: Id<GameObject>;
	private radius: number;
	public constructor(id: Id<GameObject>, radius = 1) {
		this.id = id;
		this.radius = radius;
	}
	evaluate(actor: GameObject): boolean {
		const target = getObjectById(this.id);
		return target ? actor.getRangeTo(target) === this.radius : true;
	}
}
