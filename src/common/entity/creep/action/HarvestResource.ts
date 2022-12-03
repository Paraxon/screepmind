import { Action } from "common/decisions/actions/Action";
import { ScreepsReturnCode } from "common/Library";
import { ERR_NOT_FOUND } from "game/constants";
import { Creep, Source } from "game/prototypes";
import { getObjectsByPrototype } from "game/utils";
import { CreepAction, HARVEST } from "./CreepAction";

export class HarvestResource extends CreepAction {
	private target?: Source;
	public constructor() {
		super(HARVEST);
	}
	public decide(actor: Creep): Action<Creep, ScreepsReturnCode> {
		return new HarvestResource();
	}
	public isComplete(actor: Creep): boolean {
		return actor.store.getFreeCapacity() === 0;
	}
	public execute(actor: Creep): ScreepsReturnCode | undefined {
		if (!this.target) {
			const targets = getObjectsByPrototype(Source);
			this.target = actor.findInRange(targets, 1)[0];
		}
		return this.target ? actor.harvest(this.target) : ERR_NOT_FOUND;
	}
}
