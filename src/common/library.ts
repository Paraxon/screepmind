import Flatten from "@flatten-js/core";
import { arenaInfo as Arena, constants as Consts } from "game";
import { ATTACK, CARRY, WORK } from "game/constants";
import { getCpuTime } from "game/utils";
import { CreepClassifier } from "./entity/creep/CreepClassifier";
import { Team } from "./entity/team/Team";
import * as Metric from "./math/Metric";

export const ARENA_SHAPE = new Flatten.Box(0, 0, 99, 99);
export const ARENA_POLY = new Flatten.Polygon(ARENA_SHAPE);
export const BUILD_RANGE = 3;
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
export const MOVE_FATIGUE_MODIFIER = 2;

export function remainingTimeNs() {
	return Arena.cpuTimeLimit - getCpuTime();
}

export function remainingTimeMs() {
	return Metric.convert(remainingTimeNs(), Metric.NANO, Metric.MILLI);
}

export const TEAM_FRIENDLY = new Team(true);
export const TEAM_ENEMY = new Team(false);
export const TEAM_NEUTRAL = new Team(undefined);

export const classifier = new CreepClassifier();
// export const roles = [harvester];
classifier.add("harvester").set(WORK, 5);
classifier.add("melee").set(ATTACK, 5);
// classifier.add(new Role("harvester")).set(WORK, 5);
// classifier.add(new Role("melee")).set(ATTACK, 1);
// classifier.add(new Role("hauler")).set(CARRY, 1);
classifier.add("builder").set(CARRY, 1).set(WORK, 1);
