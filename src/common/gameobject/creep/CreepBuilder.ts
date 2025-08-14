import * as Consts from "game/constants";
import * as Proto from "game/prototypes";
import * as Utils from "game/utils";
import * as Lib from "../../library.js";
import * as Func from "../../Functional.js";

export const MAX_BODY_PARTS = 50;
export const cheapestFirst = (a: Proto.BodyPartType, b: Proto.BodyPartType) =>
	Consts.BODYPART_COST[a] - Consts.BODYPART_COST[b];
export const expensiveFirst = (a: Proto.BodyPartType, b: Proto.BodyPartType) =>
	Consts.BODYPART_COST[b] - Consts.BODYPART_COST[a];
export const shuffled: Func.Compare<Proto.BodyPartType> = (a, b) => Math.random() - 0.5 > 0;

export class CreepBuilder {
	public readonly parts: Record<Proto.BodyPartType, number> = {
		[Consts.ATTACK]: 0,
		[Consts.CARRY]: 0,
		[Consts.HEAL]: 0,
		[Consts.MOVE]: 0,
		[Consts.RANGED_ATTACK]: 0,
		[Consts.TOUGH]: 0,
		[Consts.WORK]: 0
	};
	public with(type: Proto.BodyPartType, qty: number = 1): CreepBuilder {
		qty = Math.min(qty, MAX_BODY_PARTS - this.size + qty);
		this.parts[type] = Math.max(0, qty);
		return this;
	}
	public add(type: Proto.BodyPartType, qty: number = 1) {
		this.parts[type] += Math.min(qty, MAX_BODY_PARTS - this.size, 0);
		return this;
	}
	public get cost(): number {
		return Object.entries(this.parts)
			.map(([type, qty]) => Consts.BODYPART_COST[type] * qty)
			.reduce((sum, current) => sum + current, 0);
	}
	public body(compare: (a: Proto.BodyPartType, b: Proto.BodyPartType) => number = cheapestFirst): Proto.BodyPartType[] {
		return Object.entries(this.parts)
			.flatMap(([type, qty]) => Array<Proto.BodyPartType>(qty).fill(type))
			.sort(compare)
			.slice(0, MAX_BODY_PARTS);
	}
	public get size(): number {
		return Object.values(this.parts).reduce((sum, current) => sum + current);
	}
	public count(type: Proto.BodyPartType): number {
		return this.parts[type];
	}
	public fatigueGeneration(onTerrain: Utils.Terrain = Consts.TERRAIN_PLAIN): number {
		// MOVE (and empty CARRY, assume they are full) parts do not generate fatigue
		return (this.size - this.parts[Consts.MOVE]) * Lib.FATIGUE_FACTOR[onTerrain];
	}
	public fatigueReduction(): number {
		return this.parts[Consts.MOVE] * Lib.FATIGUE_REDUCTION_PER_MOVE;
	}
	public enableMovement(onTerrain: Utils.Terrain = Consts.TERRAIN_PLAIN, tickPeriod = 1): CreepBuilder {
		// Calculate the number of MOVE parts needed so that fatigue generated is offset by MOVE fatigue reduction per period
		const movesNeeded = Math.ceil(this.fatigueGeneration(onTerrain) / (Lib.FATIGUE_REDUCTION_PER_MOVE * tickPeriod));
		// Overwrite previous MOVE counts and use the calculated required number
		return this.with(Consts.MOVE, movesNeeded);
	}
	public clone(): CreepBuilder {
		return Object.entries(this.parts).reduce((result, [type, qty]) => result.with(type, qty), new CreepBuilder());
	}
	public withBudget(budget: number): CreepBuilder {
		if (this.cost === 0 || budget < Lib.MIN_BODYPART_COST) return new CreepBuilder();
		const scale = budget / this.cost;
		const result = this.scale(scale);
		return result.size > MAX_BODY_PARTS ? result.scale(MAX_BODY_PARTS / result.size) : result;
	}
	public scale(scale: number): CreepBuilder {
		return Object.entries(this.parts).reduce(
			(result, [type, qty]) => result.with(type, Math.floor(qty * scale)),
			new CreepBuilder()
		);
	}
}
