import { DecisionMaker } from "common/decisions/DecisionMaker";
import { ScreepsReturnCode } from "game/constants";
import { Creep } from "game/prototypes";

export class Role {
	public readonly name: string;
	public readonly ai?: DecisionMaker<Creep, ScreepsReturnCode>;
	public constructor(name: string, ai?: DecisionMaker<Creep, ScreepsReturnCode>) {
		this.name = name;
		this.ai = ai;
	}
}
