import { Blackboard, Expert } from "common/decisions/Blackboard";
import { ScreepsResult } from "common/gameobject/Result";
import { hauler } from "common/gameobject/creep/Roles";
import { CreepDo } from "../actions/CreepDo";
import { Team } from "../Team";

export class Economy implements Expert<Team, ScreepsResult> {
	insistence(team: Team, board: Blackboard<Team, ScreepsResult>): number {
		return 0;
	}
	write(team: Team, board: Blackboard<Team, ScreepsResult>): void {}
}
