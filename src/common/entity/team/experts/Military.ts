import { Blackboard, Expert } from "common/decisions/Blackboard";
import { DecisionTree } from "common/decisions/DecisionTree";
import { BodyRatio } from "common/entity/creep/bodyratio";
import { AttackMelee } from "common/entity/creep/action/AttackMelee";
import { MoveToObject } from "common/entity/creep/action/MoveToTarget";
import { AdjacentTo } from "common/entity/creep/condition/AdjacentTo";
import { kiter, raider } from "common/entity/creep/roles";
import { CreepDo } from "common/entity/team/actions/CreepDo";
import { SpawnCreep } from "common/entity/team/actions/SpawnCreep";
import { ScreepsReturnCode } from "common/Library";
import { Logger } from "common/patterns/Logger";
import { Verbosity } from "common/patterns/Verbosity";
import { ATTACK, RANGED_ATTACK, TERRAIN_SWAMP } from "game/constants";
import { Creep, StructureSpawn } from "game/prototypes";
import { getObjectsByPrototype } from "game/utils";
import { Team, TEAM_ENEMY } from "../Team";

export class Military implements Expert<Team, ScreepsReturnCode> {
	private melee = new BodyRatio().with(ATTACK).moveEvery(TERRAIN_SWAMP);
	private ranged = new BodyRatio().with(RANGED_ATTACK).moveEvery(TERRAIN_SWAMP);
	insistence(team: Team, board: Blackboard<Team, ScreepsReturnCode>): number {
		return 1;
	}
	write(team: Team, board: Blackboard<Team, ScreepsReturnCode>): void {
		if (team.FindRole("hauler").length >= team.FindRole("melee").length)
			this.spawn(team, board);
		this.attack(team, board);
	}
	spawn(team: Team, board: Blackboard<Team, ScreepsReturnCode>): void {
		if (team.CanAfford(this.ranged.cost) && !team.GetFirst(StructureSpawn)?.spawning) {
			board.actions.push(new SpawnCreep(this.ranged.scaledTo(team.LocalInventory())));
		}
	}
	attack(team: Team, board: Blackboard<Team, ScreepsReturnCode>): void {
		team.FindRole("melee").filter(creep => !creep.spawning).forEach(
			attacker => board.actions.push(new CreepDo(attacker.id, raider.decide(attacker)!)));
		team.FindRole("shooter").filter(creep => !creep.spawning).forEach(
			attacker => board.actions.push(new CreepDo(attacker.id, kiter.decide(attacker)!)));
	}
}