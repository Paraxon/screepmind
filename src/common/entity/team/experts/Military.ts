import { Blackboard, Expert } from "common/decisions/Blackboard";
import { CreepDo } from "common/entity/team/actions/CreepDo";
import { ScreepsReturnCode } from "common/gameobject/ReturnCode";
import { kiter, raider } from "common/gameobject/creep/Roles";
import { Team } from "../Team";

export class Military implements Expert<Team, ScreepsReturnCode> {

	insistence(team: Team, board: Blackboard<Team, ScreepsReturnCode>): number {
		return team.FindRole("combat").length;
	}
	write(team: Team, board: Blackboard<Team, ScreepsReturnCode>): void {
		this.attack(team, board);
	}
	attack(team: Team, board: Blackboard<Team, ScreepsReturnCode>): void {
		team.FindRole("melee").forEach(creep => board.actions.push(
			new CreepDo(creep.id, raider.decide(creep)!)));
		team.FindRole("ranged").forEach(creep => board.actions.push(
			new CreepDo(creep.id, kiter.decide(creep)!)));
	}
}