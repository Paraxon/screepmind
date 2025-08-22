import * as Utils from "game/utils";
import * as Consts from "game/constants";
import * as Lib from "common/library";
import * as Proto from "game/prototypes";
import * as Nav from "game/path-finder";
import { Body } from "./Body";

export * from "game/prototypes";
declare module "game/prototypes" {
	export interface Creep extends Body {
		canReachBeforeDecay(target: Proto.GameObject, options?: Nav.SearchPathOptions): boolean;
	}
}

Proto.Creep.prototype.canReachBeforeDecay = function canReachBeforeDecay(
	target: Proto.GameObject,
	options: Nav.SearchPathOptions = {}
): boolean {
	if (target.ticksToDecay === undefined) return true;
	const result = Nav.searchPath(this, target, options);
	if (result.incomplete) return false;
	const travelTime = this.ticksToTravel(result.path);
	if (travelTime === undefined) return false;
	console.log(
		`Creep ${this.id} can reach ${target.id} in ${travelTime} ticks, which decays in ${target.ticksToDecay} ticks.`
	);
	return travelTime < target.ticksToDecay;
};
// #region Body
Proto.Creep.prototype.fatigueReduction = function fatigueReduction(): Lib.Fatigue {
	// MOVE parts that are not destroyed reduce fatigue
	return this.body.filter(({ type, hits }) => type === Consts.MOVE && hits > 0).length * Lib.FATIGUE_REDUCTION_PER_MOVE;
};
Proto.Creep.prototype.countParts = function countParts(...types: Proto.BodyPartType[]): number {
	return this.body.filter(({ type }) => types.includes(type)).length;
};
Proto.Creep.prototype.size = function totalSize(): number {
	return this.body.length;
};
Proto.Creep.prototype.cost = function cost(): number {
	return this.body.reduce((sum, part) => sum + Consts.BODYPART_COST[part.type], 0);
};
Proto.Creep.prototype.movePeriod = function movePeriod(terrain: Utils.Terrain): Lib.Ticks | undefined {
	const reduction = this.fatigueReduction();
	return reduction > 0 ? Math.ceil(this.fatigueGeneration(terrain) / reduction) : undefined;
};
Proto.Creep.prototype.ticksToTravel = function ticksToTravel(path: Proto.Position[]): Lib.Ticks | undefined {
	const periods: Record<Utils.Terrain, Lib.Ticks | undefined> = {
		[Consts.TERRAIN_PLAIN]: this.movePeriod(Consts.TERRAIN_PLAIN),
		[Consts.TERRAIN_SWAMP]: this.movePeriod(Consts.TERRAIN_SWAMP),
		[Consts.TERRAIN_WALL]: undefined
	};
	const terrain = path.map(pos => Utils.getTerrainAt(pos));
	return terrain.includes(Consts.TERRAIN_WALL)
		? undefined
		: terrain.map(terrain => periods[terrain]!).reduce((sum, current) => sum + current, 0);
};
Proto.Creep.prototype.spawnTime = function spawnTime(): Lib.Ticks {
	return this.size() * Consts.CREEP_SPAWN_TIME;
};
// #endregion Body
