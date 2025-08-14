// Update the import path below if the actual location is different
import { Blackboard, Expert } from "common/decisions/Blackboard";
import { ScreepsResult } from "common/gameobject/Result";
import { Role } from "common/gameobject/creep/Role";
import { roles, classifier } from "common/gameobject/creep/roles/Roles";
import { Creep } from "game/prototypes";
import { Team } from "common/entity/team/Team";
import { CreepDo } from "../actions/CreepDo";
import { SpawnCreep } from "../actions/SpawnCreep";
import { expect } from "chai";

export class Population implements Expert<Team, ScreepsResult> {
	insistence(actor: Team, board: Blackboard<Team, ScreepsResult>): number {
		return actor.Creeps.length || roles.some(role => actor.CanAfford(role.body.cost)) ? 1 : 0;
	}
	write(team: Team, board: Blackboard<Team, ScreepsResult>): void {
		this.act(team, board);
		this.spawn(team, board);
	}
	private act(team: Team, board: Blackboard<Team, ScreepsResult>) {
		team.Creeps.map<[Creep, Role?]>(creep => [creep, classifier.classify(creep).best])
			.filter(([creep, role]) => role != undefined)
			.map(([creep, role]) => new CreepDo(creep.id, role!.decide(creep)))
			.forEach(action => board.actions.push(action));
	}
	private spawn(team: Team, board: Blackboard<Team, ScreepsResult>) {
		const classifications = team.Creeps.map(creep => classifier.classify(creep).best).filter(role => role != undefined);
		const toSpawn = roles
			.map(role => ({
				role,
				diff: role.expectedPop() - classifications.filter(result => result === role).length
			}))
			.reduce((prev, current) => (current.diff > prev.diff ? current : prev));
		// console.log(`spawning role ${toSpawn.role.name} ${toSpawn.role.body.cost} with budget ${team.LocalInventory()}`);
		if (toSpawn.role.body.cost <= team.LocalInventory())
			board.actions.push(new SpawnCreep(toSpawn.role.body.withBudget(team.LocalInventory())));
	}
}
