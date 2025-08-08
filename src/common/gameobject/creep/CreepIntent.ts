import { Creep } from "game/prototypes";
import * as Consts from "game/constants";
import { CreepResult } from "../Result";
import * as Proto from "game/prototypes";

// https://docs.screeps.com/simultaneous-actions.html

export const BUILD = "build";
export const DROP = "drop";
export const HARVEST = "harvest";
export const PICKUP = "pickup";
export const PULL = "pull";
export const RANGED_HEAL = "ranged_heal";
export const RANGED_MASS_ATTACK = "ranged_mass_attack";
export const TRANSFER = "transfer";
export const WITHDRAW = "withdraw";
export { ATTACK, HEAL, MOVE, RANGED_ATTACK } from "game/constants";

export type Intent =
	| typeof Consts.ATTACK
	| typeof BUILD
	| typeof DROP
	| typeof HARVEST
	| typeof Consts.HEAL
	| typeof Consts.MOVE
	| typeof PICKUP
	| typeof PULL
	| typeof Consts.RANGED_ATTACK
	| typeof RANGED_HEAL
	| typeof RANGED_MASS_ATTACK
	| typeof TRANSFER
	| typeof WITHDRAW;

export const METHOD = new Map<Function, Intent>([
	[Proto.Creep.prototype.attack, Consts.ATTACK],
	[Proto.Creep.prototype.build, BUILD],
	[Proto.Creep.prototype.drop, DROP],
	[Proto.Creep.prototype.harvest, HARVEST],
	[Proto.Creep.prototype.heal, Consts.HEAL],
	[Proto.Creep.prototype.move, Consts.MOVE],
	[Proto.Creep.prototype.moveTo, Consts.MOVE],
	[Proto.Creep.prototype.pickup, PICKUP],
	[Proto.Creep.prototype.pull, PULL],
	[Proto.Creep.prototype.rangedAttack, Consts.RANGED_ATTACK],
	[Proto.Creep.prototype.rangedHeal, RANGED_HEAL],
	[Proto.Creep.prototype.rangedMassAttack, RANGED_MASS_ATTACK],
	[Proto.Creep.prototype.transfer, TRANSFER],
	[Proto.Creep.prototype.withdraw, WITHDRAW]
]);

export const RANGE: Record<Intent, number | undefined> = {
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

export const ACTION_PIPELINES: Intent[][] = [
	[HARVEST, Consts.ATTACK, BUILD, RANGED_HEAL, Consts.HEAL],
	[Consts.RANGED_ATTACK, RANGED_MASS_ATTACK, BUILD, RANGED_HEAL],
	[BUILD, WITHDRAW, TRANSFER, DROP]
];
