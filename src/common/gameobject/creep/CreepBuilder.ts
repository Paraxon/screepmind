import * as Consts from "game/constants";
import { BodyPartType } from "game/prototypes";
import * as Utils from "game/utils";
import * as Lib from "../../library.js";

export const cheapestFirst: Lib.Compare<BodyPartType> = (a, b) => Consts.BODYPART_COST[a] - Consts.BODYPART_COST[b];
export const expensiveFirst: Lib.Compare<BodyPartType> = (a, b) => Consts.BODYPART_COST[b] - Consts.BODYPART_COST[a];
export const shuffled: Lib.Compare<BodyPartType> = (a, b) => Math.random() - 0.5;

export class CreepBuilder {
	public readonly parts = new Map<BodyPartType, number>();

	public with(type: BodyPartType, qty: number = 1) {
		this.parts.set(type, qty);
		return this;
	}
	public add(type: BodyPartType, qty: number = 1) {
		this.parts.set(type, (this.parts.get(type) ?? 0) + qty);
		return this;
	}
	public get cost() {
		return Array.from(this.parts.entries()).reduce((sum, [type, qty]) => sum + Consts.BODYPART_COST[type] * qty, 0);
	}
	public finalize(compare: Lib.Compare<BodyPartType> = expensiveFirst): BodyPartType[] {
		return Array.from(this.parts.entries().flatMap(([type, qty]) => Array(qty).fill(type))).sort(compare);
	}
	public get size() {
		return Array.from(this.parts.values()).reduce((sum, qty) => sum + qty);
	}
	public count(type: BodyPartType): number {
		return this.parts.get(type) ?? 0;
	}
	public fatigueGeneration(onTerrain: Utils.Terrain = Consts.TERRAIN_PLAIN) {
		// MOVE (and empty CARRY, assume they are full) parts do not generate fatigue
		return (this.size - this.count(Consts.MOVE)) * Lib.FATIGUE_FACTOR[onTerrain];
	}
	public fatigueReduction() {
		return this.count(Consts.MOVE) * Lib.FATIGUE_REDUCTION_PER_MOVE;
	}
	public enableMovement(onTerrain: Utils.Terrain = Consts.TERRAIN_PLAIN, tickPeriod = 1) {
		const result = this.clone();
		// Calculate the number of MOVE parts needed so that fatigue generated is offset by MOVE fatigue reduction per period
		const movesNeeded = Math.ceil(result.fatigueGeneration(onTerrain) / (Lib.FATIGUE_REDUCTION_PER_MOVE * tickPeriod));
		// Overwrite previous MOVE counts and use the calculated required number
		return result.with(Consts.MOVE, movesNeeded);
	}
	public clone() {
		const result = new CreepBuilder();
		this.parts.forEach((qty: number, type: BodyPartType) => result.with(type, qty));
		return result;
	}
	public withBudget(budget: number) {
		const result = new CreepBuilder();
		if (this.cost === 0 || budget < Lib.MIN_BODYPART_COST) return result;
		const scale = budget / this.cost;
		if (scale < 1) return result; // Not enough budget for even one set of parts
		this.parts.forEach((qty, type) => result.with(type, Math.floor(qty * scale)));
		return result;
	}
}
