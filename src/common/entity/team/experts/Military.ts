import { Blackboard, Expert } from "common/decisions/Blackboard";
import { AttackMelee } from "common/entity/creep/action/AttackMelee";
import { MoveToNearest } from "common/entity/creep/action/MoveToNearest";
import { BodyRatio } from "common/entity/team/actions/bodyratio";
import { CreepDo } from "common/entity/team/actions/CreepDo";
import { SpawnCreep } from "common/entity/team/actions/SpawnCreep";
import { classifier, enemy, FATIGUE_FACTOR } from "common/Library";
import { Logger } from "common/patterns/Logger";
import { Verbosity } from "common/patterns/Verbosity";
import { ATTACK, ScreepsReturnCode, TERRAIN_SWAMP } from "game/constants";
import { Creep, StructureSpawn } from "game/prototypes";
import { Team } from "../Team";

export class Military implements Expert<Team, ScreepsReturnCode> {
	private melee = new BodyRatio().with(ATTACK).moveEvery(1, FATIGUE_FACTOR[TERRAIN_SWAMP]);
	insistence(team: Team, board: Blackboard<Team, ScreepsReturnCode>): number {
		// return team.CanAfford(this.melee.cost) ? 1 : 0;
		return 1;
	}
	write(team: Team, board: Blackboard<Team, ScreepsReturnCode>): void {
		Logger.log('strategy', 'military expert is writing to the blackboard', Verbosity.Trace);
		this.spawn(team, board);
		this.attack(team, board);
	}
	spawn(team: Team, board: Blackboard<Team, ScreepsReturnCode>): void {
		const budget = team.LocalInventory();
		if (budget > this.melee.cost && team.Population === 0) {
			board.actions.push(new SpawnCreep(this.melee.scaledTo(budget)));
		}
	}
	attack(team: Team, board: Blackboard<Team, ScreepsReturnCode>): void {
		const lads = team.FindRole(classifier, "melee", 1);
		const enemySpawn = enemy.GetFirst(StructureSpawn)!;
		lads.forEach(lad => board.actions.push(new CreepDo(lad.id, new AttackMelee(enemySpawn))));
	}
}