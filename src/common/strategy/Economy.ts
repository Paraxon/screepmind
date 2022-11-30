import Flatten from "@flatten-js/core";
import { Flag } from "arena";
import { SpawnCreep } from "common/entity/team/actions/SpawnCreep";
import { CreateSite } from "common/entity/team/actions/CreateSite";
import { BodyRatio } from "common/BodyRatio";
import { Blackboard, Expert } from "common/decisions/Blackboard";
import { CARRY, ScreepsReturnCode, STRUCTURE_PROTOTYPES, WORK } from "game/constants";
import { StructureSpawn } from "game/prototypes";
import { Team } from "../entity/team/Team";

export class Economy implements Expert<Team, ScreepsReturnCode> {
	private hauler = new BodyRatio().with(CARRY).moveEvery(1);
	private builder = new BodyRatio().with(CARRY).with(WORK).moveEvery(1);
	private haulerCount = 1;
	private builderCount = 1;
	insistence(team: Team, board: Blackboard<Team, ScreepsReturnCode>): number {
		return team.Energy >= this.hauler.cost ? 1 : 0;
	}
	write(team: Team, board: Blackboard<Team, ScreepsReturnCode>): void {
		const energy = team.Energy;
		const creepCount = team.Creeps.length;
		if (creepCount < this.haulerCount && energy > this.hauler.cost) {
			board.actions.push(new SpawnCreep(this.hauler.scaledTo(energy)));
		} else if (creepCount > this.builderCount && creepCount && energy > this.builder.cost) {
			const spawn = team.GetFirst(StructureSpawn)!;
			board.actions.push(new CreateSite(STRUCTURE_PROTOTYPES.StructureSpawn, Flatten.point(spawn.x, spawn.y)));
		}
	}
}