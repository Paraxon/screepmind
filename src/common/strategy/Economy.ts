import { BodyRatio } from "common/BodyRatio";
import { Blackboard, Expert } from "common/decisions/Blackboard";
import { CARRY, ScreepsReturnCode } from "game/constants";
import { SpawnCreep, Team } from "./Team";

export class Economy implements Expert<Team, ScreepsReturnCode> {
	private hauler = new BodyRatio().with(CARRY, 1).moveEvery(1);
	insistence(team: Team, board: Blackboard<Team, ScreepsReturnCode>): number {
		return team.Energy >= this.hauler.cost ? 1 : 0;
	}
	write(team: Team, board: Blackboard<Team, ScreepsReturnCode>): void {
		const energy = team.Energy;
		if (energy > this.hauler.cost) {
			board.actions.push(new SpawnCreep(this.hauler.scaledTo(energy)));
		}
	}
}