import { Blackboard, Expert } from "common/decisions/Blackboard";
import { CreepDo } from "common/entity/team/actions/CreepDo";
import { ScreepsResult } from "common/gameobject/Result";
import { kiter, raider } from "common/gameobject/creep/Roles";
import { Team } from "../Team";

export class Military implements Expert<Team, ScreepsResult> {
	insistence(team: Team, board: Blackboard<Team, ScreepsResult>): number {
		return 0;
	}
	write(team: Team, board: Blackboard<Team, ScreepsResult>): void {}
}
