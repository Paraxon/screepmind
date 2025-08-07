import { Action } from "common/decisions/actions/Action";
import { BUILD, RANGE } from "common/gameobject/creep/CreepIntent";
import { ScreepsResult } from "common/gameobject/Result";
import { Targeter } from "common/gameobject/Targeter";
import { ERR_NOT_FOUND } from "game/constants";
import { ConstructionSite, Creep, Structure } from "game/prototypes";
import { Visual } from "game/visual";
import { CreepAction } from "./CreepAction";

export class BuildAtSite<structure_t extends Structure> extends CreepAction {
	private readonly targeter: Targeter<ConstructionSite>;
	public constructor(target: Targeter<ConstructionSite>) {
		super(BUILD);
		this.targeter = target;
	}
	public decide(actor: Creep): Action<Creep, ScreepsResult> {
		return new BuildAtSite(this.targeter);
	}
	public isComplete(actor: Creep): boolean {
		return this.targeter.isEmpty();
	}
	public execute(actor: Creep): ScreepsResult | undefined {
		this.emote(actor);
		const sites = this.targeter.inRange(actor, RANGE[BUILD]!);
		if (!sites.length) return ERR_NOT_FOUND;
		const mostProgress = (best: ConstructionSite, current: ConstructionSite) =>
			(best.progress ?? 0) > (current.progress ?? 0) ? best : current;
		return actor.build(sites.reduce(mostProgress));
	}
}
