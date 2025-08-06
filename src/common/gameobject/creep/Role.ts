import { Action } from "common/decisions/actions/Action";
import { DecisionMaker } from "common/decisions/DecisionMaker";
import { BodyRatio } from "common/gameobject/creep/BodyRatio";
import { ScreepsResult } from "common/gameobject/Result";
import { BodyPartType, Creep } from "game/prototypes";
import { getTicks } from "game/utils";

export class Role implements DecisionMaker<Creep, ScreepsResult> {
	public readonly name: string;
	public readonly body: BodyRatio;
	public readonly features: Map<BodyPartType, number>;
	private readonly popMin: number;
	private readonly popSlope: number;
	private readonly ai: DecisionMaker<Creep, ScreepsResult>;
	public constructor(
		name: string,
		body: BodyRatio,
		ai: DecisionMaker<Creep, ScreepsResult>,
		features: Iterable<[BodyPartType, number]>,
		popMin: number,
		spawnPeriod: number
	) {
		this.name = name;
		this.body = body;
		this.ai = ai;
		this.popMin = popMin;
		this.popSlope = spawnPeriod ? 1 / spawnPeriod : 0;
		this.features = new Map(features);
	}
	public expectedPop(atTick: number = getTicks()) {
		return Math.floor(this.popSlope * atTick + this.popMin);
	}
	public decide(actor: Creep): Action<Creep, ScreepsResult> {
		return this.ai.decide(actor)!;
	}
}
