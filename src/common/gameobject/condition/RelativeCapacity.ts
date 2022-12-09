import { Condition } from "common/decisions/Condition";
import { Compare, Inventory, strict_equal } from "common/Library";
import { RESOURCE_ENERGY } from "game/constants";
import { Creep, ResourceType } from "game/prototypes";

export class RelativeCapacity implements Condition<Inventory> {
	private readonly percent: number;
	private readonly resource: ResourceType;
	private readonly compare: Compare<number>;
	public constructor(percent: number, resource = RESOURCE_ENERGY, compare: Compare<number> = strict_equal) {
		this.percent = percent;
		this.resource = resource;
		this.compare = compare;
	}
	evaluate(actor: Creep): boolean {
		if (!actor.store.getCapacity(this.resource)) return true;
		const value = (actor.store.getUsedCapacity(this.resource) ?? 0) / actor.store.getCapacity(this.resource)!;
		return this.compare(value, this.percent);
	}
}