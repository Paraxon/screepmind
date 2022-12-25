import { Blackboard, Expert } from "common/decisions/Blackboard";
import { ScreepsReturnCode } from "common/gameobject/ReturnCode";
import { hauler } from "common/gameobject/creep/Roles";
import { CreepDo } from "../actions/CreepDo";
import { Team } from "../Team";

export class Economy implements Expert<Team, ScreepsReturnCode> {
	insistence(team: Team, board: Blackboard<Team, ScreepsReturnCode>): number {
		return 0;
	}
	write(team: Team, board: Blackboard<Team, ScreepsReturnCode>): void {
	}
}