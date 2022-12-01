import Flatten from "@flatten-js/core";
import { Flag } from "arena";
import { SpawnCreep } from "common/entity/team/actions/SpawnCreep";
import { CreateSite } from "common/entity/team/actions/CreateSite";
import { BodyRatio } from "common/entity/team/actions/bodyratio";
import { Blackboard, Expert } from "common/decisions/Blackboard";
import { CARRY, ScreepsReturnCode, STRUCTURE_PROTOTYPES, WORK } from "game/constants";
import { Creep, StructureSpawn } from "game/prototypes";
import { Team } from "../Team";

export class Economy implements Expert<Team, ScreepsReturnCode> {
	private hauler = new BodyRatio().with(CARRY).moveEvery(1);
	private builder = new BodyRatio().with(CARRY).with(WORK).moveEvery(1);
	private haulerCount = 1;
	private builderCount = 1;
	insistence(team: Team, board: Blackboard<Team, ScreepsReturnCode>): number {
		return team.CanAfford(this.hauler.cost) ? 1 : 0;
	}
	write(team: Team, board: Blackboard<Team, ScreepsReturnCode>): void {
		const budget = team.LocalInventory();
		if (team.Population < this.haulerCount && team.CanAfford(this.hauler.cost)) {
			board.actions.push(new SpawnCreep(this.hauler.scaledTo(budget)));
		} else if (team.Population > this.builderCount && team.Population && team.CanAfford(this.builder.cost)) {
			const spawn = team.GetFirst(StructureSpawn)!;
			board.actions.push(new CreateSite(STRUCTURE_PROTOTYPES.StructureSpawn, Flatten.point(spawn.x, spawn.y)));
		}
	}
}