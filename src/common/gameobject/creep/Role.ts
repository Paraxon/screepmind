import { Action } from "common/decisions/DecisionMaker";
import { DecisionMaker } from "common/decisions/DecisionMaker";
import { CreepBuilder } from "common/gameobject/creep/CreepBuilder";
import { ScreepsResult } from "common/gameobject/Result";
import { BodyPartType, Creep } from "game/prototypes";
import { getTicks } from "game/utils";
import { CreepClassifier } from "./CreepClassifier";

export class Role implements DecisionMaker<Creep, ScreepsResult> {
	public readonly features: Map<BodyPartType, number>;
	private readonly popSlope: number;
	public constructor(
		public readonly name: string,
		public readonly body: CreepBuilder,
		private readonly ai: DecisionMaker<Creep, ScreepsResult>,
		features: Iterable<[BodyPartType, number]>,
		private readonly popMin: number,
		spawnPeriod: number
	) {
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

export let roles: Role[] = new Array<Role>();
export const classifier = new CreepClassifier<Role>();
