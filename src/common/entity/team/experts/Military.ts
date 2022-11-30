import { BodyRatio } from "common/entity/team/actions/bodyratio";
import { Blackboard, Expert } from "common/decisions/Blackboard";
import { MoveToNearest } from "common/entity/creep/action/MoveToNearest";
import { SpawnCreep } from "common/entity/team/actions/SpawnCreep";
import { CreepDo } from "common/entity/team/actions/CreepDo";
import { Logger } from "common/patterns/Logger";
import { Verbosity } from "common/patterns/Verbosity";
import { ATTACK, ScreepsReturnCode, STRUCTURE_PROTOTYPES } from "game/constants";
import { StructureSpawn } from "game/prototypes";
import { Team } from "../Team";

export class Military implements Expert<Team, ScreepsReturnCode> {
	private melee = new BodyRatio().with(ATTACK).moveEvery();
	insistence(team: Team, board: Blackboard<Team, ScreepsReturnCode>): number {
		return team.Energy >= this.melee.cost ? 1 : 0;
	}
	write(team: Team, board: Blackboard<Team, ScreepsReturnCode>): void {
		const energy = team.Energy;
		if (energy > this.melee.cost) {
			board.actions.push(new SpawnCreep(this.melee.scaledTo(energy)));
		}
		const fighters = team.Creeps.filter(creep => creep.body.some(part => part.type === ATTACK));
		fighters.forEach(creep => board.actions.push(new CreepDo(creep.id, new MoveToNearest<StructureSpawn>(StructureSpawn))));
		Logger.log('strategy', 'military expert is writing to the blackboard', Verbosity.Trace);
	}
}