import { Attack } from "common/actions/creep/Intent";
import { BodyRatio } from "common/BodyRatio";
import { Blackboard, Expert } from "common/decisions/Blackboard";
import { ATTACK, CARRY, ScreepsReturnCode } from "game/constants";
import { SpawnCreep, Team } from "../entity/team/Team";

export class Military implements Expert<Team, ScreepsReturnCode> {
	private melee = new BodyRatio().with(ATTACK).moveEvery();
	insistence(team: Team, board: Blackboard<Team, ScreepsReturnCode>): number {
		return team.Energy >= this.melee.cost ? 1 : 0;
	}
	write(team: Team, board: Blackboard<Team, ScreepsReturnCode>): void {
		const energy = team.Energy;
		if (energy > this.melee.cost) {
			board.actions.push(new SpawnCreep(this.melee.scaledTo(energy)));
		}
	}
}