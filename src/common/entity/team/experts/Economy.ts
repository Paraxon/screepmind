import { Blackboard, Expert } from "common/decisions/Blackboard";
import { BodyRatio } from "common/gameobject/creep/BodyRatio";
import { builder, hauler } from "common/gameobject/creep/Roles";
import { SpawnCreep } from "common/entity/team/actions/SpawnCreep";
import { ScreepsReturnCode } from "common/Library";
import { Logger } from "common/patterns/Logger";
import { CARRY, WORK } from "game/constants";
import { CreepDo } from "../actions/CreepDo";
import { Team } from "../Team";

export class Economy implements Expert<Team, ScreepsReturnCode> {
	private haulerBody = new BodyRatio().with(CARRY).moveEvery();
	private builderBody = new BodyRatio().with(CARRY).with(WORK).moveEvery();
	private haulerCount = 1;
	private builderCount = 1;
	insistence(team: Team, board: Blackboard<Team, ScreepsReturnCode>): number {
		return 1;
	}
	write(team: Team, board: Blackboard<Team, ScreepsReturnCode>): void {
		const budget = team.LocalInventory();
		const combats = team.FindRole("combat");
		const haulers = team.FindRole("hauler");
		const builders = team.FindRole("builder");
		if (combats.length > haulers.length + builders.length) {
			const body = haulers.length > builders.length ? this.builderBody : this.haulerBody;
			if (team.CanAfford(body.cost)) board.actions.push(new SpawnCreep(body));
		}
		this.harvest(team, board);
	}
	// build(team: Team, board: Blackboard<Team, any>) {
	// 	const type = STRUCTURE_PROTOTYPES.StructureTower;
	// 	const site = team.GetFirst(ConstructionSite) as ConstructionSite | undefined;
	// 	if (site) {
	// 		const build = new BuildAtSite(site);
	// 		const harvest = new HarvestResource();
	// 		const builders = team.FindRole("builder");
	// 		builders.forEach(builder => board.actions.push(
	// 			new CreepDo(
	// 				builder.id,
	// 				builder.store.getFreeCapacity(RESOURCE_ENERGY) === 0 ? build : harvest)));
	// 	}
	// 	if (team.Population > this.builderCount && team.Population && team.CanAfford(this.builder.cost)) {
	// 		const spawn = team.GetFirst(StructureTower)!;
	// 		board.actions.push(new CreateSite(type, Flatten.point(spawn.x, spawn.y)));
	// 	}
	// }
	spawn(team: Team, board: Blackboard<Team, ScreepsReturnCode>) {
		if (team.CanAfford(this.haulerBody.cost)) {
			// Logger.log('strategy', `team can afford ${this.hauler.cost} for new hauler`);
			board.actions.push(new SpawnCreep(this.haulerBody.scaledTo(team.LocalInventory())));
		}
	}
	harvest(team: Team, board: Blackboard<Team, ScreepsReturnCode>) {
		team.FindRole("hauler").forEach(creep => board.actions.push(new CreepDo(creep.id, hauler.decide(creep)!)));
		team.FindRole("builder").forEach(creep => board.actions.push(new CreepDo(creep.id, builder.decide(creep)!)));
	}
}