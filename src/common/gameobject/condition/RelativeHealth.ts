import { Condition } from "common/decisions/Condition";
import { Compare, Inventory, OwnedGameObject, strict_equal } from "common/Library";
import { RESOURCE_ENERGY } from "game/constants";
import { Creep, OwnedStructure, ResourceType, Structure } from "game/prototypes";

export class RelativeHealth implements Condition<Creep | Structure> {
	private readonly percent: number;
	private readonly compare: Compare<number>;
	public constructor(percent: number, compare: Compare<number> = strict_equal) {
		this.percent = percent;
		this.compare = compare;
	}
	evaluate(actor: Creep): boolean {
		return this.compare(actor.hits / actor.hitsMax, this.percent);
	}
}