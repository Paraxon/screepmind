import { Team } from "common/entity/team/Team";
import { ScreepsResult } from "common/gameobject/Result";
import { ID } from "common/library";
import { Creep } from "game/prototypes";
import { getObjectById } from "game/utils";
import { Action } from "common/decisions/DecisionMaker";

export class CreepDo implements Action<Team, ScreepsResult> {
	private id: ID;
	private action: Action<Creep, ScreepsResult>;
	public constructor(id: ID, action: Action<Creep, ScreepsResult>) {
		this.id = id;
		this.action = action;
	}
	decide(_actor: Team): Action<Team, any> {
		const creep = getObjectById(this.id as string)! as Creep;
		return new CreepDo(this.id, this.action.decide(creep));
	}
	execute(_actor: Team): ScreepsResult {
		const creep = getObjectById(this.id as string)! as Creep;
		return this.action.execute(creep)!;
	}
	canDoBoth(other: Action<Team, any>): boolean {
		return other instanceof CreepDo && this.id === other.id && this.action.canDoBoth(other.action);
	}
	isComplete(_actor: Team): boolean {
		let creep = getObjectById(this.id as string)! as Creep;
		return this.action.isComplete(creep);
	}
}
