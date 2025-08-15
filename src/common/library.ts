import Flatten from "@flatten-js/core";
import * as Consts from "game/constants";
import * as Proto from "game/prototypes";
import * as Utils from "game/utils";

// Screeps Oversights
export type ID = number | string;
export type Health = Proto.Structure | Proto.Creep;
export type Range = number;
export type Ticks = number;
export type Fatigue = number;
export type Inventory = Proto.GameObject & { store: Proto.Store };
export type OwnedGameObject = Proto.GameObject & { my?: boolean };

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
