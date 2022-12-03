import * as Consts from "game/constants";
import * as Lib from "../Library.js";
import * as Utils from "game/utils";
import { BodyPartType } from "game/prototypes";

export class BodyRatio {
	private parts = new Map<BodyPartType, number>();

	public with(type: BodyPartType, qty: number = 1) {
		this.parts.set(type, qty);
		return this;
	}
	public add(type: BodyPartType, qty: number) {
		this.parts.set(type, this.parts.get(type) ?? 0 + qty);
		return this;
	}
	public get cost() {
		let cost = 0;
		for (const [type, qty] of this.parts) cost += Consts.BODYPART_COST[type] * qty;
		return cost;
	}
	public get spawn(): BodyPartType[] {
		return this.priorities.flatMap(type => new Array(this.parts.get(type)).fill(type) as BodyPartType[]);
	}
	public get priorities(): BodyPartType[] {
		return Array.from(this.parts.keys()).sort((a, b) => Consts.BODYPART_COST[a] - Consts.BODYPART_COST[b]);
	}
	public get size() {
		return Array.from(this.parts.values()).reduce((sum, qty) => sum + qty);
	}
	public count(type: BodyPartType): number {
		return this.parts.get(type) ?? 0;
	}
	public fatigueParts(carryCapacity: number) {
		// MOVE and empty CARRY parts do not generate fatigue
		const carryParts = this.count(Consts.CARRY);
		const usedCarries = Math.ceil(carryParts * carryCapacity);
		return this.size - this.count(Consts.MOVE) - (carryParts - usedCarries);
	}
	public fatigue(onTerrain: Utils.Terrain = Consts.TERRAIN_PLAIN, carryCapacity = 1) {
		const fatigue = this.fatigueParts(carryCapacity) * Lib.FATIGUE_FACTOR[onTerrain];
		// MOVE parts reduce fatigue
		return fatigue - this.count(Consts.MOVE) * Lib.MOVE_FATIGUE_MODIFIER;
	}
	public moveEvery(onTerrain: Utils.Terrain = Consts.TERRAIN_PLAIN, tickPeriod = 1) {
		const result = new BodyRatio();
		this.parts.forEach((qty, type) => result.with(type, qty));
		const movesNeeded = result.fatigue(onTerrain) / Lib.MOVE_FATIGUE_MODIFIER /* / tickPeriod */;
		return result.add(Consts.MOVE, movesNeeded);
	}
	public scaledTo(budget: number, fractional = false) {
		const ratio = new BodyRatio();
		const cost = this.cost;
		const scale = Math.floor(budget / cost);
		for (const [type, qty] of this.parts) ratio.with(type, qty * scale);

		if (fractional) {
			let change = budget % cost;
			for (const type of this.priorities)
				if (change > Consts.BODYPART_COST[type]) {
					const max = Math.floor(change / Consts.BODYPART_COST[type]);
					const qty = Math.min(this.parts.get(type) ?? max, max);
					ratio.add(type, qty);
					change -= Consts.BODYPART_COST[type] * qty;
				}
		}

		return ratio;
	}
}
