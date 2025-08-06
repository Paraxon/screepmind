import { Team } from "common/entity/team/Team";
import { is_error, ScreepsResult } from "common/gameobject/Result";
import { Speech } from "common/gameobject/Speech";
import { ID } from "common/library";
import { Logger } from "common/patterns/Logger";
import { Verbosity } from "common/patterns/Verbosity";
import { Creep } from "game/prototypes";
import { getObjectById } from "game/utils";
import { Action } from "../../../decisions/actions/Action";
import { ERROR_EMOJI } from "common/gameobject/Emoji";

export class CreepDo implements Action<Team, ScreepsResult> {
	private id: ID;
	private action: Action<Creep, ScreepsResult>;
	public constructor(id: ID, action: Action<Creep, ScreepsResult>) {
		this.id = id;
		this.action = action;
	}
	decide(actor: Team): Action<Team, any> {
		const creep = getObjectById(this.id as string)! as Creep;
		return new CreepDo(this.id, this.action.decide(creep));
	}
	execute(actor: Team): ScreepsResult | undefined {
		const creep = getObjectById(this.id as string)! as Creep;
		const result = this.action.execute(creep)!;
		if (is_error(result)) {
			Speech.say(creep, ERROR_EMOJI[result]);
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
