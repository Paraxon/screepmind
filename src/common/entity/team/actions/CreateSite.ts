import { Team, TEAM_FRIENDLY } from "common/entity/team/Team";
import { ScreepsReturnCode } from "common/gameobject/ReturnCode";
import { Prototype } from "common/Library";
import { MAX_CONSTRUCTION_SITES, OK } from "game/constants";
import { ConstructionSite, Position, Structure } from "game/prototypes";
import { createConstructionSite } from "game/utils";
import { Action } from "../../../decisions/actions/Action";

export class CreateSite implements Action<Team, ScreepsReturnCode> {
	private position: Position;
	private structure: Prototype<Structure>;
	private site?: ConstructionSite;
	public constructor(structure: Prototype<Structure>, position: Position) {
		this.structure = structure;
		this.position = position;
	}
	decide(actor: Team): Action<Team, ScreepsReturnCode> {
		return new CreateSite(this.structure, this.position);
	}
	execute(actor: Team): ScreepsReturnCode | undefined {
		const result = createConstructionSite(this.position, this.structure);
		this.site = result.object;
		return result.object ? OK : result.error;
	}
	canDoBoth(other: Action<Team, ScreepsReturnCode>): boolean {
		return other instanceof CreateSite ?
			TEAM_FRIENDLY.GetAll(ConstructionSite).length + 1 <= MAX_CONSTRUCTION_SITES :
			true;
	}
	isComplete(actor: Team): boolean {
		return this.site !== undefined;
	}
}
