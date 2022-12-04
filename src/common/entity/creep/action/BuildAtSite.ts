import { Action } from "common/decisions/actions/Action";
import { ID, ScreepsReturnCode } from "common/Library";
import { BUILD } from "common/entity/creep/CreepIntent";
import { ConstructionSite, Creep } from "game/prototypes";
import { getObjectById } from "game/utils";
import { CreepAction } from "./CreepAction";

export class BuildAtSite extends CreepAction {
	private id: ID;
	public constructor(target: ConstructionSite) {
		super(BUILD);
		this.id = target.id;
	}
	public decide(actor: Creep): Action<Creep, ScreepsReturnCode> {
		const site = getObjectById(this.id as string) as ConstructionSite;
		return new BuildAtSite(site);
	}
	public isComplete(actor: Creep): boolean {
		const site = getObjectById(this.id as string) as ConstructionSite;
		return site.progress === site.progressTotal;
	}
	public execute(actor: Creep): ScreepsReturnCode | undefined {
		const site = getObjectById(this.id as string) as ConstructionSite;
		return actor.build(site);
	}
}
