import { Blackboard, Expert } from "common/decisions/Blackboard";
import { ScreepsReturnCode } from "common/gameobject/ReturnCode";
import { hauler } from "common/gameobject/creep/Roles";
import { CreepDo } from "../actions/CreepDo";
import { Team } from "../Team";

export class Economy implements Expert<Team, ScreepsReturnCode> {
	insistence(team: Team, board: Blackboard<Team, ScreepsReturnCode>): number {
		return team.FindRole("hauler").length;
	}
	write(team: Team, board: Blackboard<Team, ScreepsReturnCode>): void {
		this.harvest(team, board);
	}
	harvest(team: Team, board: Blackboard<Team, ScreepsReturnCode>) {
		team.FindRole("hauler").forEach(creep => board.actions.push(new CreepDo(creep.id, hauler.decide(creep)!)));
	}
}