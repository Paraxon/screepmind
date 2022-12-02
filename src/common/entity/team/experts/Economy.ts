import Flatten from "@flatten-js/core";
import { Blackboard, Expert } from "common/decisions/Blackboard";
import { BuildAtSite } from "common/entity/creep/action/BuildAtSite";
import { HarvestResource } from "common/entity/creep/action/HarvestResource";
import { BodyRatio } from "common/entity/bodyratio";
import { CreateSite } from "common/entity/team/actions/CreateSite";
import { SpawnCreep } from "common/entity/team/actions/SpawnCreep";
import { classifier } from "common/Library";
import { CARRY, RESOURCE_ENERGY, ScreepsReturnCode, STRUCTURE_PROTOTYPES, WORK } from "game/constants";
import { ConstructionSite, StructureSpawn, StructureTower } from "game/prototypes";
import { CreepDo } from "../actions/CreepDo";
import { Team } from "../Team";

export class Economy implements Expert<Team, ScreepsReturnCode> {
	private hauler = new BodyRatio().with(CARRY).moveEvery();
	private builder = new BodyRatio().with(CARRY).with(WORK).moveEvery(1);
	private haulerCount = 1;
	private builderCount = 1;
	insistence(team: Team, board: Blackboard<Team, ScreepsReturnCode>): number {
		return team.CanAfford(this.hauler.cost) ? 1 : 0;
	}
	write(team: Team, board: Blackboard<Team, ScreepsReturnCode>): void {
		const budget = team.LocalInventory();
		this.spawn(team, board);
		this.build(team, board);
	}
	build(team: Team, board: Blackboard<Team, any>) {
		const type = STRUCTURE_PROTOTYPES.StructureTower;
		const site = team.GetFirst(ConstructionSite) as ConstructionSite | undefined;
		if (site) {
			const build = new BuildAtSite(site);
			const harvest = new HarvestResource();
			const builders = team.FindRole(classifier, "builder");
			builders.forEach(builder => board.actions.push(
				new CreepDo(
					builder.id,
					builder.store.getFreeCapacity(RESOURCE_ENERGY) === 0 ? build : harvest)));
		}
		if (team.Population > this.builderCount && team.Population && team.CanAfford(this.builder.cost)) {
			const spawn = team.GetFirst(StructureTower)!;
			board.actions.push(new CreateSite(type, Flatten.point(spawn.x, spawn.y)));
		}
	}
	spawn(team: Team, board: Blackboard<Team, ScreepsReturnCode>) {
		const budget = team.LocalInventory();
		if (team.Population < this.haulerCount && team.CanAfford(this.hauler.cost)) {
			board.actions.push(new SpawnCreep(this.hauler.scaledTo(budget)));
		}

	}
}