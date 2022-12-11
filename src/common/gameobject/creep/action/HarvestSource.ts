import { Action } from "common/decisions/actions/Action";
import { HARVEST, INTENT_RANGE } from "common/gameobject/creep/CreepIntent";
import { ScreepsReturnCode } from "common/Library";
import { ERR_NOT_FOUND } from "game/constants";
import { Creep, Source } from "game/prototypes";
import { getObjectsByPrototype } from "game/utils";
import { CreepAction } from "./CreepAction";

export class HarvestSource extends CreepAction {
	public constructor() {
		super(HARVEST);
	}
	public decide(actor: Creep): Action<Creep, ScreepsReturnCode> {
		return new HarvestSource();
	}
	public isComplete(actor: Creep): boolean {
		return !actor.store.getFreeCapacity();
	}
	public execute(actor: Creep): ScreepsReturnCode | undefined {
		this.emote(actor);
		const targets = this.getTargets(actor);
		return targets.length ? actor.harvest(targets[0]) : ERR_NOT_FOUND;
	}
	private getTargets(actor: Creep) {
		return actor.findInRange(getObjectsByPrototype(Source), INTENT_RANGE[HARVEST]!);
	}
}
