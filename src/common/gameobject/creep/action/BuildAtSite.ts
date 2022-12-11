import { Action } from "common/decisions/actions/Action";
import { BUILD, INTENT_RANGE } from "common/gameobject/creep/CreepIntent";
import { ScreepsReturnCode } from "common/gameobject/ReturnCode";
import { Targeter } from "common/gameobject/Targeter";
import { ERR_NOT_FOUND } from "game/constants";
import { ConstructionSite, Creep, Structure } from "game/prototypes";
import { Visual } from "game/visual";
import { CreepAction } from "./CreepAction";

export class BuildAtSite<structure_t extends Structure> extends CreepAction {
	private readonly targeter: Targeter<ConstructionSite>
	public constructor(target: Targeter<ConstructionSite>) {
		super(BUILD);
		this.targeter = target
	}
	public decide(actor: Creep): Action<Creep, ScreepsReturnCode> {
		return new BuildAtSite(this.targeter);
	}
	public isComplete(actor: Creep): boolean {

		return this.targeter.isEmpty();
	}
	public execute(actor: Creep): ScreepsReturnCode | undefined {
		const sites = this.targeter.inRange(actor, INTENT_RANGE[BUILD]!);
		if (!sites.length) return ERR_NOT_FOUND;
		new Visual().text("🔨", actor, { font: 2 / 3 });
		const mostProgress = (best: ConstructionSite, current: ConstructionSite) =>
			(best.progress ?? 0) > (current.progress ?? 0) ? best : current;
		return actor.build(sites.reduce(mostProgress));
	}
}
