import { ERR_NOT_OWNER, ERR_NO_PATH, ERR_NAME_EXISTS, ERR_BUSY, ERR_NOT_FOUND, ERR_NOT_ENOUGH_ENERGY, ERR_NOT_ENOUGH_RESOURCES, ERR_INVALID_TARGET, ERR_FULL, ERR_NOT_IN_RANGE, ERR_INVALID_ARGS, ERR_TIRED, ERR_NO_BODYPART, ERR_NOT_ENOUGH_EXTENSIONS, OK } from "game/constants";
import { CreepAttackResult, CreepBuildResult, CreepDropResult, CreepHarvestResult, CreepHealResult, CreepMoveResult, CreepPickupResult, CreepPullResult, CreepRangedAttackResult, CreepRangedHealResult, CreepRangedMassAttackResult, CreepTransferResult, CreepWithdrawResult } from "game/prototypes";

export type CreepReturnCode =
	CreepAttackResult
	| CreepBuildResult
	| CreepDropResult
	| CreepHarvestResult
	| CreepHealResult
	| CreepMoveResult
	| CreepPickupResult
	| CreepPullResult
	| CreepRangedAttackResult
	| CreepRangedHealResult
	| CreepRangedMassAttackResult
	| CreepTransferResult
	| CreepWithdrawResult;
export type ScreepsReturnCode =
	CreepReturnCode
	| typeof ERR_NO_PATH
	| typeof ERR_NAME_EXISTS
	| typeof ERR_BUSY
	| typeof ERR_NOT_FOUND;

export function is_error(value: ScreepsReturnCode): boolean {
	return value < OK;
}

export const ERROR_EMOJI: Record<ScreepsReturnCode, string> = {
	[OK]: "👍",
	[ERR_NOT_OWNER]: "💢🙅",
	[ERR_NO_PATH]: "🗺️🤷",
	[ERR_NAME_EXISTS]: "🪪🙅",
	[ERR_BUSY]: "💦🙅",
	[ERR_NOT_FOUND]: "🔍🤷",
	[ERR_NOT_ENOUGH_ENERGY]: "🪫🙅",
	[ERR_NOT_ENOUGH_RESOURCES]: "💰🙅",
	[ERR_INVALID_TARGET]: "🎯🤦",
	[ERR_FULL]: "📦🙅",
	[ERR_NOT_IN_RANGE]: "📏🙅",
	[ERR_INVALID_ARGS]: "🎁🤦",
	[ERR_TIRED]: "💤🙅",
	[ERR_NO_BODYPART]: "💪🙅",
	[ERR_NOT_ENOUGH_EXTENSIONS]: "🔌🙅"
}