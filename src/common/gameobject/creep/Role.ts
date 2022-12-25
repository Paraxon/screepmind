import { Action } from "common/decisions/actions/Action";
import { DecisionMaker } from "common/decisions/DecisionMaker";
import { BodyRatio } from "common/gameobject/creep/BodyRatio";
import { ScreepsReturnCode } from "common/gameobject/ReturnCode";
import { BodyPartType, Creep } from "game/prototypes";
import { getTicks } from "game/utils";

export class Role implements DecisionMaker<Creep, ScreepsReturnCode> {
	public readonly name: string;
	public readonly body: BodyRatio;
	public readonly features: Map<BodyPartType, number>;
	private readonly popMin: number;
	private readonly popSlope: number;
	private readonly ai: DecisionMaker<Creep, ScreepsReturnCode>;
	public constructor(name: string, body: BodyRatio, ai: DecisionMaker<Creep, ScreepsReturnCode>, features: Iterable<[BodyPartType, number]>, popMin: number, spawnPeriod: number) {
		this.name = name;
		this.body = body;
		this.ai = ai;
		this.popMin = popMin;
		this.popSlope = 1 / spawnPeriod;
		this.features = new Map(features);
	}
	public expectedPop(atTick: number = getTicks()) {
		return Math.floor(this.popSlope * atTick + this.popMin);
	}
	public decide(actor: Creep): Action<Creep, ScreepsReturnCode> {
		return this.ai.decide(actor)!;
	}
}
