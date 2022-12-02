import * as Consts from "game/constants";
import { Terrain } from "game/utils";
import * as Lib from "../Library.js";

export class BodyRatio {
	private parts = new Map<Consts.BodyPartConstant, number>();

	public with(type: Consts.BodyPartConstant, qty: number = 1) {
		this.parts.set(type, qty);
		return this;
	}
	public add(type: Consts.BodyPartConstant, qty: number) {
		this.parts.set(type, this.parts.get(type) ?? 0 + qty);
	}
	public get cost() {
		let cost = 0;
		for (const [type, qty] of this.parts) cost += Consts.BODYPART_COST[type] * qty;
		return cost;
	}
	public get spawn(): Consts.BodyPartConstant[] {
		return this.priorities.flatMap(type => new Array(this.parts.get(type)).fill(type) as Consts.BodyPartConstant[]);
	}
	public get priorities(): Consts.BodyPartConstant[] {
		return Array.from(this.parts.keys()).sort((a, b) => Consts.BODYPART_COST[a] - Consts.BODYPART_COST[b]);
	}
	public get size() {
		return Array.from(this.parts.values()).reduce((sum, qty) => sum + qty);
	}
	public get burden() {
		return this.size - (this.parts.get(Consts.MOVE) ?? 0);
	}
	public fatigue(onTerrain: Terrain = Consts.TERRAIN_PLAIN) {
		const moveParts = this.parts.get(Consts.MOVE) ?? 0;
		// MOVE parts do not contribute to fatigue generation
		const fatigue = (this.size - moveParts) * Lib.FATIGUE_FACTOR[onTerrain];
		// MOVE parts reduce fatigue
		return fatigue - moveParts * Lib.MOVE_FATIGUE_MODIFIER;
	}
	public moveEvery(tickPeriod = 1, onTerrain: Terrain = Consts.TERRAIN_PLAIN) {
		const result = new BodyRatio();
		this.parts.forEach((type, qty) => result.with(type, qty));
		const moveParts = result.fatigue(onTerrain) / Lib.MOVE_FATIGUE_MODIFIER /* / tickPeriod */;
		return result.with(Consts.MOVE, moveParts);
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
