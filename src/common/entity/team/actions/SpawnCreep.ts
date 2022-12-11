import { Team } from "common/entity/team/Team";
import { BodyRatio } from "common/gameobject/creep/BodyRatio";
import { ScreepsReturnCode } from "common/gameobject/ReturnCode";
import { ERR_NOT_FOUND } from "game/constants";
import { StructureSpawn } from "game/prototypes";
import { Action } from "../../../decisions/actions/Action";

export class SpawnCreep implements Action<Team, ScreepsReturnCode> {
	flag = false;
	ratio: BodyRatio;
	public constructor(ratio: BodyRatio) {
		this.ratio = ratio;
	}
	public decide(actor: Team): Action<Team, ScreepsReturnCode> {
		return new SpawnCreep(this.ratio);
	}
	public execute(actor: Team): ScreepsReturnCode | undefined {
		this.flag = true;
		return actor.GetFirst(StructureSpawn)?.spawnCreep(this.ratio.spawn).error ?? ERR_NOT_FOUND;
	}
	public canDoBoth(other: Action<Team, ScreepsReturnCode>): boolean {
		throw new Error("Method not implemented.");
	}
	public isComplete(actor: Team): boolean {
		return this.flag;
	}
}
