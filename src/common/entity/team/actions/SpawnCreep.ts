import { Team } from "common/entity/team/Team";
import { CreepBuilder } from "common/gameobject/creep/CreepBuilder";
import { ScreepsResult } from "common/gameobject/Result";
import { ERR_NOT_FOUND } from "game/constants";
import { StructureSpawn } from "game/prototypes";
import { Action } from "common/decisions/DecisionMaker";
import { Logger } from "common/patterns/Logger";

export class SpawnCreep implements Action<Team, ScreepsResult> {
	flag = false;
	ratio: CreepBuilder;
	public constructor(ratio: CreepBuilder) {
		this.ratio = ratio;
	}
	public decide(actor: Team): Action<Team, ScreepsResult> {
		return new SpawnCreep(this.ratio);
	}
	public execute(actor: Team): ScreepsResult | undefined {
		this.flag = true;
		const spawn = actor.GetFirst(StructureSpawn);
		Logger.log("debug", `spawning creep from spawn ${spawn?.id}`);
		return actor.GetFirst(StructureSpawn)?.spawnCreep(this.ratio.finalize()).error ?? ERR_NOT_FOUND;
	}
	public canDoBoth(other: Action<Team, ScreepsResult>): boolean {
		throw new Error("Method not implemented.");
	}
	public isComplete(actor: Team): boolean {
		return this.flag;
	}
}
