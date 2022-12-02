import { Blackboard, Expert } from "common/decisions/Blackboard";
import { DecisionTree } from "common/decisions/DecisionTree";
import { AttackMelee } from "common/entity/creep/action/AttackMelee";
import { MoveToObject } from "common/entity/creep/action/MoveToTarget";
import { AdjacentTo, InRangeOf } from "common/entity/creep/CreepConditions";
import { Attack } from "common/entity/creep/Intent";
import { BodyRatio } from "common/entity/bodyratio";
import { CreepDo } from "common/entity/team/actions/CreepDo";
import { SpawnCreep } from "common/entity/team/actions/SpawnCreep";
import { classifier, FATIGUE_FACTOR, TEAM_ENEMY } from "common/Library";
import { Logger } from "common/patterns/Logger";
import { Verbosity } from "common/patterns/Verbosity";
import { ATTACK, ScreepsReturnCode, TERRAIN_SWAMP } from "game/constants";
import { Creep, StructureSpawn } from "game/prototypes";
import { Team } from "../Team";

export class Military implements Expert<Team, ScreepsReturnCode> {
	private melee = new BodyRatio().with(ATTACK).moveEvery(TERRAIN_SWAMP);
	insistence(team: Team, board: Blackboard<Team, ScreepsReturnCode>): number {
		return team.CanAfford(this.melee.cost) || team.FindRole(classifier, "melee").length > 0 ? 1 : 0;
	}
	write(team: Team, board: Blackboard<Team, ScreepsReturnCode>): void {
		Logger.log('strategy', 'military expert is writing to the blackboard', Verbosity.Trace);
		this.spawn(team, board);
		this.attack(team, board);
	}
	spawn(team: Team, board: Blackboard<Team, ScreepsReturnCode>): void {
		if (team.LocalInventory() > this.melee.cost && team.Population === 0) {
			board.actions.push(new SpawnCreep(this.melee.scaledTo(team.LocalInventory())));
		}
	}
	attack(team: Team, board: Blackboard<Team, ScreepsReturnCode>): void {
		const enemySpawn = TEAM_ENEMY.GetFirst(StructureSpawn)!;
		const attackSpawn = new AttackMelee(enemySpawn.id);
		const moveToSpawn = new MoveToObject(enemySpawn.id);
		const nextToSpawn = new AdjacentTo(enemySpawn.id);
		const ai = new DecisionTree<Creep, ScreepsReturnCode>(nextToSpawn, attackSpawn, moveToSpawn);
		team.FindRole(classifier, "melee", 1).forEach(
			attacker => board.actions.push(new CreepDo(attacker.id, ai.decide(attacker)!)));
	}
}