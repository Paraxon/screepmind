import { ATTACK, HEAL, MOVE, RANGED_ATTACK } from "game/constants";
import { Creep } from "game/prototypes";

// https://docs.screeps.com/simultaneous-actions.html

export const BUILD = 'build';
export const DROP = 'drop';
export const HARVEST = 'harvest';
export const PICKUP = 'pickup';
export const PULL = 'pull';
export const RANGED_HEAL = 'ranged_heal';
export const RANGED_MASS_ATTACK = 'ranged_mass_attack';
export const TRANSFER = 'transfer';
export const WITHDRAW = 'withdraw';

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

export const INTENT_METHODS: Record<string, Intent> = {
	[Creep.prototype.attack.name]: ATTACK,
	[Creep.prototype.build.name]: BUILD,
	[Creep.prototype.drop.name]: DROP,
	[Creep.prototype.harvest.name]: HARVEST,
	[Creep.prototype.heal.name]: HEAL,
	[Creep.prototype.move.name]: MOVE,
	[Creep.prototype.pickup.name]: PICKUP,
	[Creep.prototype.pull.name]: PULL,
	[Creep.prototype.rangedAttack.name]: RANGED_ATTACK,
	[Creep.prototype.rangedHeal.name]: RANGED_HEAL,
	[Creep.prototype.rangedMassAttack.name]: RANGED_MASS_ATTACK,
	[Creep.prototype.transfer.name]: TRANSFER,
	[Creep.prototype.withdraw.name]: WITHDRAW
}

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

export const INTENT_EMOJI: Record<Intent, string> = {
	[ATTACK]: "⚔️",
	[BUILD]: "🛠️",
	[DROP]: "🪂",
	[HARVEST]: "🧑‍🌾",
	[HEAL]: "⚕️",
	[MOVE]: "🏃",
	[PICKUP]: "🏋️",
	[PULL]: "🧲",
	[RANGED_ATTACK]: "🏹",
	[RANGED_HEAL]: "🏹⚕️",
	[RANGED_MASS_ATTACK]: "🏹💣",
	[TRANSFER]: "📤",
	[WITHDRAW]: "📥"
}