import * as Result from "common/gameobject/Result";
import * as Const from "game/constants";
import * as Nav from "game/path-finder";
import * as Proto from "game/prototypes";
import * as Intent from "../CreepIntent";
import * as Utils from "game/utils";
import { CreepAction } from "./CreepAction";

export class NavAction extends CreepAction {
	public constructor(
		private readonly targets: (actor: Proto.Creep) => Proto.Position[],
		private readonly options: Nav.SearchPathOptions
	) {
		super(Intent.Intent.MOVE);
	}
	public execute(actor: Proto.Creep): Result.ScreepsResult {
		this.emote(actor);
		const targets = this.targets(actor);
		if (!targets.length) return Const.ERR_INVALID_TARGET;
		const goals: Nav.Goal[] = this.targets(actor).map(pos => ({
			pos,
			range: Intent.RANGE[Intent.Intent.RANGED_ATTACK]!
		}));
		if (!goals.length) return Const.ERR_INVALID_TARGET;
		const destination = Nav.searchPath(actor, goals, this.options).path.at(1);
		if (!destination) return Const.ERR_NO_PATH;
		const dx = destination.x - actor.x;
		const dy = destination.y - actor.y;
		return actor.move(Utils.getDirection(dx, dy));
	}
	public isComplete(actor: Proto.Creep): boolean {
		return !this.targets(actor).length;
	}
}
