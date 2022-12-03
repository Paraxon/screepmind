import { ID } from "common/Library";
import { GameObject } from "game/prototypes";
import { getObjectById } from "game/utils";
import { Condition } from "../../../decisions/Condition";

export class AdjacentTo implements Condition<GameObject> {
	private id: ID;
	private radius: number;
	public constructor(id: ID, radius = 1) {
		this.id = id;
		this.radius = radius;
	}
	evaluate(actor: GameObject): boolean {
		const target = getObjectById(this.id as string);
		return target ? actor.getRangeTo(target) === this.radius : true;
	}
}
