import Flatten from "@flatten-js/core";
import { Blackboard, Expert } from "common/decisions/Blackboard";
import { ScreepsReturnCode } from "common/gameobject/ReturnCode";
import { builder } from "common/gameobject/creep/Roles";
import { ConstructionSite, StructureRampart, StructureSpawn } from "game/prototypes";
import { CreateSite } from "../actions/CreateSite";
import { CreepDo } from "../actions/CreepDo";
import { Team } from "../Team";

export class Construction implements Expert<Team, ScreepsReturnCode> {
	insistence(actor: Team, board: Blackboard<Team, number>): number {
		return actor.FindRole("builder").length;
	}
	write(actor: Team, board: Blackboard<Team, number>): void {
		this.fortifySpawns(actor, board);
		actor.FindRole("builder").forEach(creep => board.actions.push(new CreepDo(creep.id, builder.decide(creep)!)));
	}
	private fortifySpawns(actor: Team, board: Blackboard<Team, number>) {
		const spawns = actor.GetAll(StructureSpawn);
		const ramparts = actor.GetAll(StructureRampart);
		const sites = actor.GetAll(ConstructionSite).filter(site => site.structure instanceof StructureRampart);
		const undefended = spawns
			.filter(spawn => ramparts.every(rampart => spawn.x != rampart.x && spawn.y != rampart.y))
			.filter(spawn => sites.every(site => spawn.x != site.x && spawn.x != site.y));
		undefended.forEach(spawn => board.actions.push(new CreateSite(StructureRampart, Flatten.point(spawn.x, spawn.y))));
	}
}