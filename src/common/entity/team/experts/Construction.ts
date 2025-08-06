import { Blackboard, Expert } from "common/decisions/Blackboard";
import { ScreepsResult } from "common/gameobject/Result";
import { ConstructionSite, StructureRampart, StructureSpawn } from "game/prototypes";
import { CreateSite } from "../actions/CreateSite";
import { Team } from "../Team";

export class Construction implements Expert<Team, ScreepsResult> {
	insistence(actor: Team, board: Blackboard<Team, number>): number {
		return this.undefended.length;
	}
	write(actor: Team, board: Blackboard<Team, number>): void {
		this.fortifySpawns(actor, board);
	}
	private fortifySpawns(actor: Team, board: Blackboard<Team, number>) {
		this.undefended(actor)
			.map(spawn => new CreateSite(StructureRampart, spawn))
			.forEach(action => board.actions.push(action));
	}
	private undefended(actor: Team): StructureSpawn[] {
		const ramparts = actor.GetAll(StructureRampart);
		const sites = actor.GetAll(ConstructionSite).filter(site => site.structure instanceof StructureRampart);
		return actor
			.GetAll(StructureSpawn)
			.filter(spawn => ramparts.every(rampart => spawn.x != rampart.x && spawn.y != rampart.y))
			.filter(spawn => sites.every(site => spawn.x != site.x && spawn.x != site.y));
	}
}
