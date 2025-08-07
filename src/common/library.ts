import Flatten from "@flatten-js/core";
import * as Consts from "game/constants";
import * as Proto from "game/prototypes";
import * as Utils from "game/utils";
import { ScreepsResult } from "./gameobject/Result";

// Functional
export type Predicate<arg_t> = (arg: arg_t) => boolean;
export type BinaryPredicate<lhs_t, rhs_t> = (lhs: lhs_t, rhs: rhs_t) => boolean;
export type Reducer<value_t> = (lhs: value_t, rhs: value_t) => value_t;
export type SingleTargetIntent = (target: Proto.Creep | Proto.Structure) => ScreepsResult;
export type Compare<value_t> = (lhs: value_t, rhs: value_t) => number;
export const strict_equal: Compare<number> = (lhs: number, rhs: number) => (lhs === rhs ? 0 : -1);
export const greater: Compare<number> = (lhs: number, rhs: number) => (lhs > rhs ? 1 : -1);
export const greater_equal: Compare<number> = (lhs: number, rhs: number) => (lhs >= rhs ? 1 : -1);
export const less: Compare<number> = (lhs: number, rhs: number) => (lhs < rhs ? -1 : 1);
export const less_equal: Compare<number> = (lhs: number, rhs: number) => (lhs <= rhs ? -1 : 1);

// Screeps Oversights
export type ID = number | string;
export type Prototype<object_t extends Proto.GameObject> = new () => object_t;
export type Health = { hits?: number; hitsMax?: number };
export type Target = Proto.GameObject & Health;
export type Distance = number;
export type Inventory = Proto.GameObject & { store: Proto.Store };
export interface OwnedGameObject extends Proto.GameObject {
	my?: boolean;
}

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
