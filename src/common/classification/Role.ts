import { DecisionMaker } from "common/decisions/DecisionMaker";
import { BodyPartConstant, ScreepsReturnCode } from "game/constants";
import { Creep } from "game/prototypes";

export class Role {
	public readonly name: string;
	public features = new Map<BodyPartConstant, number>();
	public constructor(name: string) {
		this.name = name;
	}
}
