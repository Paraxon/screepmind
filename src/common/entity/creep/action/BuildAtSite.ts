import { Action } from "common/decisions/actions/Action";
import { BUILD_RANGE } from "common/Library";
import { ERR_NOT_FOUND, ScreepsReturnCode } from "game/constants";
import { ConstructionSite, Creep } from "game/prototypes";
import { getObjectsByPrototype } from "game/utils";
import { Build } from "../Intent";


export class BuildAtSite extends Build {
	private target?: ConstructionSite;
	public decide(actor: Creep): Action<Creep, ScreepsReturnCode> {
		return new BuildAtSite();
	}
	public isComplete(actor: Creep): boolean {
		return this.target !== undefined && this.target!.progress === this.target!.progressTotal;
	}
	public execute(actor: Creep): ScreepsReturnCode | undefined {
		if (!this.target) {
			const targets = getObjectsByPrototype(ConstructionSite);
			this.target = actor.findInRange(targets, BUILD_RANGE)[0];
		}
		return this.target ? actor.build(this.target) : ERR_NOT_FOUND;
	}
}
