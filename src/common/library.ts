import Flatten from "@flatten-js/core";
import * as Consts from "game/constants";
import * as Proto from "game/prototypes";
import * as Utils from "game/utils";
import { CreepClassifier } from "./entity/creep/CreepClassifier";
import { Team } from "./entity/team/Team";
import * as Metric from "./math/Metric";

export const ARENA_SHAPE = new Flatten.Box(0, 0, 99, 99);
export const ARENA_POLY = new Flatten.Polygon(ARENA_SHAPE);
export const BUILD_RANGE = 3;
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
