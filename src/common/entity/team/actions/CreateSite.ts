import Flatten from "@flatten-js/core";
import { Team } from "common/entity/team/Team";
import { createConstructionSite } from "game";
import { ScreepsReturnCode, BuildableStructure, OK } from "game/constants";
import { ConstructionSite, StructureConstant } from "game/prototypes";
import { Action } from "../../../decisions/actions/Action";


export class CreateSite implements Action<Team, ScreepsReturnCode> {
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
