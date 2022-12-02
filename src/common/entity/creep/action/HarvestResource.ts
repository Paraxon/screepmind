import { Action } from "common/decisions/actions/Action";
import { ERR_NOT_FOUND, ScreepsReturnCode } from "game/constants";
import { Creep, Source } from "game/prototypes";
import { getObjectsByPrototype } from "game/utils";
import { Harvest } from "../intent/Intent";


export class HarvestResource extends Harvest {
	private target?: Source;
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
