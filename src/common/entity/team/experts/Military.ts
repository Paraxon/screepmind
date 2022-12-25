import { Blackboard, Expert } from "common/decisions/Blackboard";
import { CreepDo } from "common/entity/team/actions/CreepDo";
import { ScreepsReturnCode } from "common/gameobject/ReturnCode";
import { kiter, raider } from "common/gameobject/creep/Roles";
import { Team } from "../Team";

export class Military implements Expert<Team, ScreepsReturnCode> {

	insistence(team: Team, board: Blackboard<Team, ScreepsReturnCode>): number {
		return 0;
	}
	write(team: Team, board: Blackboard<Team, ScreepsReturnCode>): void {
	}
}