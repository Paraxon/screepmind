import { Team } from "common/entity/team/Team";
import { CreepAction } from "common/gameobject/creep/action/CreepAction";
import { INTENT_EMOJI } from "common/gameobject/creep/CreepIntent";
import { ERROR_EMOJI, is_error, ScreepsReturnCode } from "common/gameobject/ReturnCode";
import { ID } from "common/Library";
import { Logger } from "common/patterns/Logger";
import { Verbosity } from "common/patterns/Verbosity";
import { Creep } from "game/prototypes";
import { getObjectById } from "game/utils";
import { Visual } from "game/visual";
import { Action } from "../../../decisions/actions/Action";

export class CreepDo implements Action<Team, ScreepsReturnCode> {
	private id: ID;
	private action: Action<Creep, ScreepsReturnCode>;
	public constructor(id: ID, action: Action<Creep, ScreepsReturnCode>) {
		this.id = id;
		this.action = action;
	}
	decide(actor: Team): Action<Team, any> {
		const creep = getObjectById(this.id as string)! as Creep;
		return new CreepDo(this.id, this.action.decide(creep));
	}
	execute(actor: Team): ScreepsReturnCode | undefined {
		const creep = getObjectById(this.id as string)! as Creep;
		const result = this.action.execute(creep)!;
		if (is_error(result)) {
			Logger.say(creep, ERROR_EMOJI[result]);
			Logger.log("action", `creep ${this.id} returned error ${result} after acting`, Verbosity.Error);
		}
		return result;
	}
	canDoBoth(other: Action<Team, any>): boolean {
		return other instanceof CreepDo && this.id === other.id && this.action.canDoBoth(other.action);
	}
	isComplete(actor: Team): boolean {
		let creep = getObjectById(this.id as string)! as Creep;
		return this.action.isComplete(creep);
	}
}
