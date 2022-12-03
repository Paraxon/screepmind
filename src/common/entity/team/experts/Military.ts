import { Blackboard, Expert } from "common/decisions/Blackboard";
import { DecisionTree } from "common/decisions/DecisionTree";
import { BodyRatio } from "common/entity/bodyratio";
import { AttackMelee } from "common/entity/creep/action/AttackMelee";
import { MoveToObject } from "common/entity/creep/action/MoveToTarget";
import { AdjacentTo } from "common/entity/creep/condition/AdjacentTo";
import { CreepDo } from "common/entity/team/actions/CreepDo";
import { SpawnCreep } from "common/entity/team/actions/SpawnCreep";
import { classifier, ScreepsReturnCode, TEAM_ENEMY } from "common/Library";
import { Logger } from "common/patterns/Logger";
import { Verbosity } from "common/patterns/Verbosity";
import { ATTACK, TERRAIN_SWAMP } from "game/constants";
import { Creep, StructureSpawn } from "game/prototypes";
import { getObjectsByPrototype } from "game/utils";
import { Team } from "../Team";

export class Military implements Expert<Team, ScreepsReturnCode> {
	private melee = new BodyRatio().with(ATTACK).moveEvery(TERRAIN_SWAMP);
	insistence(team: Team, board: Blackboard<Team, ScreepsReturnCode>): number {
		return 1;
	}
	write(team: Team, board: Blackboard<Team, ScreepsReturnCode>): void {
		Logger.log('strategy', 'military expert is writing to the blackboard', Verbosity.Trace);
		if (team.FindRole(classifier, "hauler").length >= team.FindRole(classifier, "melee").length)
			this.spawn(team, board);
		this.attack(team, board);
	}
	spawn(team: Team, board: Blackboard<Team, ScreepsReturnCode>): void {
		if (team.CanAfford(this.melee.cost)) {
			Logger.log('strategy', 'military suggests spawning new creep');
			board.actions.push(new SpawnCreep(this.melee.scaledTo(team.LocalInventory())));
		}
	}
	attack(team: Team, board: Blackboard<Team, ScreepsReturnCode>): void {
		const enemySpawn = TEAM_ENEMY.GetFirst(StructureSpawn)!
		const attackSpawn = new AttackMelee(enemySpawn.id);
		const moveToSpawn = new MoveToObject(enemySpawn.id);
		const nextToSpawn = new AdjacentTo(enemySpawn.id);
		const ai = new DecisionTree<Creep, ScreepsReturnCode>(nextToSpawn, attackSpawn, moveToSpawn);
		team.FindRole(classifier, "melee").forEach(
			attacker => board.actions.push(new CreepDo(attacker.id, ai.decide(attacker)!)));
	}
}