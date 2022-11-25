import Flatten from "@flatten-js/core";
import { BodyRatio } from "common/BodyRatio";
import { Team } from "common/entity/team/Team";
import { createConstructionSite } from "game";
import { ScreepsReturnCode, ERR_NOT_FOUND, BuildableStructure, OK } from "game/constants";
import { StructureSpawn, _Constructor, ConstructionSite, StructureConstant, Creep, Id } from "game/prototypes";
import { getObjectById } from "game/utils";
import { Action } from "../../decisions/actions/Action";

export class SpawnCreep implements Action<Team, ScreepsReturnCode> {
	flag = false;
	ratio: BodyRatio;
	public constructor(ratio: BodyRatio) {
		this.ratio = ratio;
		this.flag = true;
	}
	public decide(actor: Team): Action<Team, ScreepsReturnCode> {
		return new SpawnCreep(this.ratio);
	}
	public execute(actor: Team): ScreepsReturnCode | undefined {
		return actor.GetFirst(StructureSpawn)?.spawnCreep(this.ratio.spawn).error ?? ERR_NOT_FOUND;
	}
	public canDoBoth(other: Action<Team, ScreepsReturnCode>): boolean {
		throw new Error("Method not implemented.");
	}
	public isComplete(actor: Team): boolean {
		return this.flag;
	}
}

export class CreateSite implements Action<Team, ScreepsReturnCode>{
	private position: Flatten.Point;
	private structure: StructureConstant;
	private site?: ConstructionSite<BuildableStructure>;
	private flag = false;
	public constructor(structure: StructureConstant, position: Flatten.Point) {
		this.structure = structure;
		this.position = position;
	}
	decide(actor: Team): Action<Team, ScreepsReturnCode> {
		return new CreateSite(this.structure, this.position);
	}
	execute(actor: Team): ScreepsReturnCode | undefined {
		const result = createConstructionSite(this.position.x, this.position.y, this.structure);
		return result.object ? OK : result.error;
	}
	canDoBoth(other: Action<Team, ScreepsReturnCode>): boolean {
		throw new Error("Method not implemented.");
	}
	isComplete(actor: Team): boolean {
		return this.site !== undefined && this.site?.progress === this.site?.progressTotal;
	}
}

export class CreepDo implements Action<Team, ScreepsReturnCode> {
	private id: Id<Creep>;
	private action: Action<Creep, ScreepsReturnCode>;
	public constructor(id: Id<Creep>, action: Action<Creep, ScreepsReturnCode>) {
		this.id = id;
		this.action = action;
	}
	decide(actor: Team): Action<Team, any> {
		throw new Error("Method not implemented.");
	}
	execute(actor: Team): ScreepsReturnCode | undefined {
		let creep = getObjectById(this.id)!;
		return this.action.execute(creep);
	}
	canDoBoth(other: Action<Team, any>): boolean {
		return true;
	}
	isComplete(actor: Team): boolean {
		return this.action.isComplete(getObjectById(this.id)!)
	}

}