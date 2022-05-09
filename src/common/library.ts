import * as Metric from "./metric";
import { arenaInfo as Arena, constants as Consts, getCpuTime } from "game";
import Flatten from "@flatten-js/core";

export const ARENA_SHAPE = new Flatten.Box(0, 0, 99, 99);
export const ARENA_POLY = new Flatten.Polygon(ARENA_SHAPE);
export const TERRAIN_PLAIN = 0;
export const PATH_COST = {
	[TERRAIN_PLAIN]: 2,
	[Consts.TERRAIN_WALL]: Infinity,
	[Consts.TERRAIN_SWAMP]: 5
};
export const FATIGUE_FACTOR = {
	[TERRAIN_PLAIN]: 1,
	[Consts.TERRAIN_WALL]: Infinity,
	[Consts.TERRAIN_SWAMP]: 2
};

export function remainingTimeNs() {
	return Arena.cpuTimeLimit - getCpuTime();
}

export function remainingTimeMs() {
	return Metric.convert(remainingTimeNs(), Metric.NANO, Metric.MILLI);
}
