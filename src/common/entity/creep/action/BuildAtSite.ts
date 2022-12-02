import { Action } from "common/decisions/actions/Action";
import { BUILD_RANGE } from "common/Library";
import { ERR_NOT_FOUND, ERR_NOT_IN_RANGE, ScreepsReturnCode } from "game/constants";
import { ConstructionSite, Creep, Id } from "game/prototypes";
import { getObjectById, getObjectsByPrototype } from "game/utils";
import { Build } from "../Intent";


export class BuildAtSite extends Build {
	private id: Id<ConstructionSite>;
	public constructor(target: ConstructionSite) {
		super();
		this.id = target.id;
	}
	public decide(actor: Creep): Action<Creep, ScreepsReturnCode> {
		const site = getObjectById(this.id) as ConstructionSite;
		return new BuildAtSite(site);
	}
	public isComplete(actor: Creep): boolean {
		const site = getObjectById(this.id) as ConstructionSite;
		return site.progress === site.progressTotal;
	}
	public execute(actor: Creep): ScreepsReturnCode | undefined {
		const site = getObjectById(this.id) as ConstructionSite;
		const result = actor.build(site);
		if (result === ERR_NOT_IN_RANGE)
			return actor.moveTo(site);
		return result;
	}
}
