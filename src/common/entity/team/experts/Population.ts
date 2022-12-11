import { Blackboard, Expert } from "common/decisions/Blackboard";
import { ScreepsReturnCode } from "common/gameobject/ReturnCode";
import { SpawnCreep } from "../actions/SpawnCreep";
import { Team } from "../Team";
import { roles } from "./roles";

export class Population implements Expert<Team, ScreepsReturnCode> {
	insistence(actor: Team, board: Blackboard<Team, number>): number {
		return roles.some(role => actor.CanAfford(role.body.cost)) ? 1 : 0;
	}
	write(team: Team, board: Blackboard<Team, number>): void {
		const underpopulated = roles.filter(role =>
			team.CanAfford(role.body.cost) &&
			team.FindRole(role.name).length < role.expectedPop());
		if (underpopulated.length) {
			const nextRole = underpopulated.reduce((best, current) => best.expectedPop() - team.FindRole(best.name).length
				> current.expectedPop() - team.FindRole(current.name).length ? best : current);
			board.actions.push(new SpawnCreep(nextRole.body.scaledTo(team.LocalInventory())));
		}
	}
}