import { Intent } from "./creep/CreepIntent";
import { ScreepsResult } from "./Result";
import * as Result from "game/constants";

export const INTENT_EMOJI: Record<Intent, string> = {
	attack: "⚔️",
	build: "🛠️",
	drop: "🚮",
	harvest: "🧑‍🌾",
	heal: "⚕️",
	move: "🏃",
	pickup: "🏋️",
	pull: "🧲",
	ranged_attack: "🏹",
	ranged_heal: "🏹⚕️",
	ranged_mass_attack: "🏹💣",
	transfer: "📥",
	withdraw: "📤"
};

export const ERROR_EMOJI: Record<ScreepsResult, string> = {
	[Result.OK]: "👍",
	[Result.ERR_NOT_OWNER]: "💢",
	[Result.ERR_NO_PATH]: "🗺️",
	[Result.ERR_NAME_EXISTS]: "🪪",
	[Result.ERR_BUSY]: "💦",
	[Result.ERR_NOT_FOUND]: "🔍",
	[Result.ERR_NOT_ENOUGH_ENERGY]: "🪫",
	[Result.ERR_INVALID_TARGET]: "🎯",
	[Result.ERR_FULL]: "🫃",
	[Result.ERR_NOT_IN_RANGE]: "📏",
	[Result.ERR_INVALID_ARGS]: "🎁",
	[Result.ERR_TIRED]: "💤",
	[Result.ERR_NO_BODYPART]: "💪"
	// [Result.ERR_NOT_ENOUGH_RESOURCES]: "💸",
	// [Result.ERR_NOT_ENOUGH_EXTENSIONS]: "🔌"
};
