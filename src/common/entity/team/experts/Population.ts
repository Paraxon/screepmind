import { Blackboard, Expert } from "common/decisions/Blackboard";
import { ScreepsResult } from "common/gameobject/Result";
import { Role } from "common/gameobject/creep/Role";
import { classifier, roles } from "common/gameobject/creep/Roles";
import { Creep } from "game/prototypes";
import { Team } from "../Team";
import { CreepDo } from "../actions/CreepDo";
import { SpawnCreep } from "../actions/SpawnCreep";

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
		const counts = new Map<Role, number>(roles.map(role => [role, 0]));
		team.Creeps.map(creep => classifier.classify(creep).best)
			.filter(role => role != undefined)
			.forEach(role => counts.set(role!, counts.get(role!) ?? 0 + 1));
		const diffs = new Map<Role, number>(
			Array.from(counts.entries()).map(([role, count]) => [role, role.expectedPop() - count])
		);
		const underpopulated = Array.from(diffs.entries()).filter(
			([role, diff]) => diff > 0 && team.CanAfford(role.body.cost)
		);
		if (!underpopulated.length) return;
		const spawnRole = underpopulated.reduce((best, current) => (best[1] > current[1] ? best : current))[0];
		board.actions.push(new SpawnCreep(spawnRole.body.withBudget(team.LocalInventory())));
	}
}
