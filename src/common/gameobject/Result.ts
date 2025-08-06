import * as Error from "game/constants";
import * as Result from "game/prototypes";

export type CreepResult =
	| Result.CreepAttackResult
	| Result.CreepBuildResult
	| Result.CreepDropResult
	| Result.CreepHarvestResult
	| Result.CreepHealResult
	| Result.CreepMoveResult
	| Result.CreepPickupResult
	| Result.CreepPullResult
	| Result.CreepRangedAttackResult
	| Result.CreepRangedHealResult
	| Result.CreepRangedMassAttackResult
	| Result.CreepTransferResult
	| Result.CreepWithdrawResult;

export type ScreepsResult =
	| CreepResult
	| typeof Error.ERR_NO_PATH
	| typeof Error.ERR_NAME_EXISTS
	| typeof Error.ERR_BUSY
	| typeof Error.ERR_NOT_FOUND;

export function is_error(value: ScreepsResult): boolean {
	return value < Error.OK;
}
