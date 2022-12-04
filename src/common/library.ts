import Flatten from "@flatten-js/core";
import * as Consts from "game/constants";
import { RANGED_ATTACK } from "game/constants";
import * as Proto from "game/prototypes";
import * as Utils from "game/utils";
import * as Metric from "./math/Metric";

export const ARENA_SHAPE = new Flatten.Box(0, 0, 99, 99);
export const ARENA_POLY = new Flatten.Polygon(ARENA_SHAPE);

export const DROP = 'drop';
export const BUILD = 'build';
export const HARVEST = 'harvest';
export const PICKUP = 'pickup';
export const PULL = 'pull';
export const RANGED_HEAL = 'ranged_heal';
export const RANGED_MASS_ATTACK = 'ranged_mass_attack';
export const WITHDRAW = 'withdraw';
export const TRANSFER = 'transfer';

export type Intent =
	typeof Consts.ATTACK |
	typeof BUILD |
	typeof DROP |
	typeof HARVEST |
	typeof Consts.HEAL |
	typeof Consts.MOVE |
	typeof PICKUP |
	typeof PULL |
	typeof RANGED_ATTACK |
	typeof RANGED_HEAL |
	typeof RANGED_MASS_ATTACK |
	typeof TRANSFER |
	typeof WITHDRAW;

export const ADJACENT = 1;
export const INTENT_RANGE: Record<Intent, number | undefined> = {
	[Consts.ATTACK]: 1,
	[BUILD]: 3,
	[DROP]: undefined,
	[HARVEST]: 1,
	[Consts.HEAL]: 1,
	[Consts.MOVE]: undefined,
	[PICKUP]: 1,
	[PULL]: 1,
	[Consts.RANGED_ATTACK]: 3,
	[RANGED_HEAL]: 3,
	[RANGED_MASS_ATTACK]: 3,
	[TRANSFER]: 1,
	[WITHDRAW]: 1
};
// export const TERRAIN_PLAIN: Terrain = 0;
// export type Terrain = typeof TERRAIN_PLAIN | typeof TERRAIN_SWAMP | typeof TERRAIN_WALL;
export const PATH_COST: Record<Utils.Terrain, number> = {
	[Consts.TERRAIN_PLAIN]: 2,
	[Consts.TERRAIN_WALL]: Infinity,
	[Consts.TERRAIN_SWAMP]: 5
};
// https://docs.screeps.com/creeps.html#Movement
export const FATIGUE_FACTOR: Record<Utils.Terrain, number> = {
	[Consts.TERRAIN_PLAIN]: 2,
	[Consts.TERRAIN_WALL]: Infinity,
	[Consts.TERRAIN_SWAMP]: 10
};
export const MOVE_FATIGUE_MODIFIER = 2;

export type ScreepsReturnCode = number;
export type ID = number | string;
export type Prototype<object_t extends Proto.GameObject> = new () => object_t;

export function remainingTimeNs() {
	return /* arenaInfo.cpuTimeLimit */50000 - Utils.getCpuTime();
}

export function remainingTimeMs() {
	return Metric.convert(remainingTimeNs(), Metric.NANO, Metric.MILLI);
}
