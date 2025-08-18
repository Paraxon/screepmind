import Flatten from "@flatten-js/core";
import * as Consts from "game/constants";
import * as Proto from "game/prototypes";
import * as Utils from "game/utils";
import * as Nav from "game/path-finder";

// Screeps Oversights
export type ID = number | string;
export type Health = Proto.Structure | Proto.Creep;
export type Range = number;
export type Ticks = number;
export type Fatigue = number;
export type Inventory = Proto.GameObject & { store: Proto.Store };
export type OwnedGameObject = Proto.GameObject & { my?: boolean };
export type Bank = Proto.StructureSpawn | Proto.StructureExtension;

// Arena Dimensions
export const ARENA_SHAPE = new Flatten.Box(0, 0, 99, 99);
export const ARENA_POLY = new Flatten.Polygon(ARENA_SHAPE);

// Movement
// https://docs.screeps.com/creeps.html#Movement
export const PATH_COST: Record<Utils.Terrain, number> = {
	[Consts.TERRAIN_PLAIN]: 2,
	[Consts.TERRAIN_WALL]: Infinity,
	[Consts.TERRAIN_SWAMP]: 5
};
export const FATIGUE_FACTOR: Record<Utils.Terrain, number> = {
	[Consts.TERRAIN_PLAIN]: 2,
	[Consts.TERRAIN_WALL]: Infinity,
	[Consts.TERRAIN_SWAMP]: 10
};

export const MIN_BODYPART_COST = Math.min(...(Object.values(Consts.BODYPART_COST) as number[]));
export const FATIGUE_REDUCTION_PER_MOVE = 2; // Each MOVE body part decreases fatigue points by 2 per tick
export const FLEE_SEARCH_RADIUS = 10;

export function creepFatigueGeneration(creep: Proto.Creep, terrain: Utils.Terrain = Consts.TERRAIN_PLAIN): Fatigue {
	return creep.body.filter(({ type, hits }) => type !== Consts.MOVE && hits > 0).length * FATIGUE_FACTOR[terrain];
}
export function creepFatigueReduction(creep: Proto.Creep): Fatigue {
	return creep.body.filter(({ type }) => type === Consts.MOVE).length * FATIGUE_REDUCTION_PER_MOVE;
}
export function creepMovePeriod(creep: Proto.Creep, terrain: Utils.Terrain = Consts.TERRAIN_PLAIN): Ticks | undefined {
	const reduction = creepFatigueReduction(creep);
	return reduction > 0 ? Math.ceil(creepFatigueGeneration(creep, terrain) / reduction) : undefined;
}
export function ticksToTravel(creep: Proto.Creep, path: Proto.Position[]): Ticks | undefined {
	const periods: Record<Utils.Terrain, Ticks | undefined> = {
		[Consts.TERRAIN_PLAIN]: creepMovePeriod(creep, Consts.TERRAIN_PLAIN),
		[Consts.TERRAIN_SWAMP]: creepMovePeriod(creep, Consts.TERRAIN_SWAMP),
		[Consts.TERRAIN_WALL]: undefined
	};
	const terrain = path.map(pos => Utils.getTerrainAt(pos));
	return terrain.includes(Consts.TERRAIN_WALL)
		? undefined
		: terrain.map(terrain => periods[terrain]!).reduce((sum, current) => sum + current, 0);
}
export function canReachBeforeDecay(
	creep: Proto.Creep,
	target: Proto.GameObject,
	options: Nav.SearchPathOptions = {}
): boolean {
	if (target.ticksToDecay === undefined) return true;
	const path = Utils.findPath(creep, target, options);
	const travelTime = ticksToTravel(creep, path);
	if (travelTime === undefined) return false;
	console.log(
		`Creep ${creep.id} can reach ${target.id} in ${travelTime} ticks, which decays in ${target.ticksToDecay} ticks.`
	);
	return travelTime < target.ticksToDecay;
}
