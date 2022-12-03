import { Team } from "common/entity/team/Team";
import { ID, ScreepsReturnCode } from "common/Library";
import { Creep } from "game/prototypes";
import { getObjectById } from "game/utils";
import { Action } from "../../../decisions/actions/Action";

export class CreepDo implements Action<Team, ScreepsReturnCode> {
	private id: ID;
	private action: Action<Creep, ScreepsReturnCode>;
	public constructor(id: ID, action: Action<Creep, ScreepsReturnCode>) {
		this.id = id;
		this.action = action;
	}
	decide(actor: Team): Action<Team, any> {
		return this;
	}
	execute(actor: Team): ScreepsReturnCode | undefined {
		let creep = getObjectById(this.id as string)! as Creep;
		return this.action.execute(creep);
	}
	canDoBoth(other: Action<Team, any>): boolean {
		return true;
	}
	isComplete(actor: Team): boolean {
		let creep = getObjectById(this.id as string)! as Creep;
		return this.action.isComplete(creep);
	}
}
