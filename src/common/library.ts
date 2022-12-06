import Flatten from "@flatten-js/core";
import * as Consts from "game/constants";
import * as Proto from "game/prototypes";
import * as Utils from "game/utils";

export type Predicate<arg_t> = (arg: arg_t) => boolean;
export type BinaryPredicate<lhs_t, rhs_t> = (lhs: lhs_t, rhs: rhs_t) => boolean;
export type Distance = number;

// Screeps Oversights
export type ScreepsReturnCode = number;
export type ID = number | string;
export type Prototype<object_t extends Proto.GameObject> = new () => object_t;
export type Health = { hits?: number, hitsMax?: number };
export type Target = Proto.Creep | Proto.Structure;

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
export const MOVE_FATIGUE_MODIFIER = 2;