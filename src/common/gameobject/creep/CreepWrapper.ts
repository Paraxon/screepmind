import * as Lib from "common/library";
import * as Consts from "game/constants";
import * as Proto from "game/prototypes";
import * as Utils from "game/utils";
import * as Nav from "game/path-finder";
import { Body } from "./Body";
import { Decorator } from "../../patterns/Decorator";

export class CreepWrapper extends Body {
	constructor(public readonly creep: Proto.Creep) {
		super();
		return new Proxy(this, new Decorator<Proto.Creep, CreepWrapper>());
	}
	canReachBeforeDecay(target: Proto.GameObject, options: Nav.SearchPathOptions = {}): boolean {
		if (target.ticksToDecay === undefined) return true;
		const result = Nav.searchPath(this.creep, target, options);
		if (result.incomplete) return false;
		const travelTime = this.ticksToTravel(result.path);
		return travelTime === undefined ? false : travelTime < target.ticksToDecay;
	}
	// #region Body
	get cost(): number {
		return this.creep.body.reduce((sum, part) => sum + Consts.BODYPART_COST[part.type], 0);
	}
	get size(): number {
		return this.creep.body.length;
	}
	fatigueGeneration(terrain: Utils.Terrain = Consts.TERRAIN_PLAIN): Lib.Fatigue {
		// MOVE (and empty CARRY, assume they are full) parts do not generate fatigue
		return (this.size - this.countParts(Consts.MOVE)) * Lib.FATIGUE_FACTOR[terrain];
	}
	countParts(...types: Proto.BodyPartType[]): number {
		return this.creep.body.filter(({ type }) => types.includes(type)).length;
	}
	// #endregion
}
