import { ATTACK, HEAL, MOVE, RANGED_ATTACK } from "game/constants";

// https://docs.screeps.com/simultaneous-actions.html

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
	typeof ATTACK |
	typeof BUILD |
	typeof DROP |
	typeof HARVEST |
	typeof HEAL |
	typeof MOVE |
	typeof PICKUP |
	typeof PULL |
	typeof RANGED_ATTACK |
	typeof RANGED_HEAL |
	typeof RANGED_MASS_ATTACK |
	typeof TRANSFER |
	typeof WITHDRAW;

export const INTENT_RANGE: Record<Intent, number | undefined> = {
	[ATTACK]: 1,
	[BUILD]: 3,
	[DROP]: undefined,
	[HARVEST]: 1,
	[HEAL]: 1,
	[MOVE]: undefined,
	[PICKUP]: 1,
	[PULL]: 1,
	[RANGED_ATTACK]: 3,
	[RANGED_HEAL]: 3,
	[RANGED_MASS_ATTACK]: 3,
	[TRANSFER]: 1,
	[WITHDRAW]: 1
};

export const ACTION_PIPELINES: Intent[][] = [
	[HARVEST, ATTACK, BUILD, RANGED_HEAL, HEAL],
	[RANGED_ATTACK, RANGED_MASS_ATTACK, BUILD, RANGED_HEAL],
	[BUILD, WITHDRAW, TRANSFER, DROP]
];