import { Creep } from "game/prototypes";
import * as Consts from "game/constants";
import * as Result from "../Result";
import * as Proto from "game/prototypes";

export function bindResourceAction<target_t extends Proto.GameObject>(
	action: (target: target_t, resource: Proto.ResourceType, amount?: number | undefined) => Result.CreepResult,
	type: Proto.ResourceType = Consts.RESOURCE_ENERGY
): (target: target_t) => Result.CreepResult {
	return function (this: Creep, target: target_t) {
		return action.call(this, target, type);
	};
}

export const transferEnergyAction = bindResourceAction(Proto.Creep.prototype.transfer);
export const withdrawEnergyAction = bindResourceAction(Proto.Creep.prototype.withdraw);

// https://docs.screeps.com/simultaneous-actions.html

export enum Intent {
	ATTACK = "attack",
	BUILD = "build",
	DROP = "drop",
	HARVEST = "harvest",
	HEAL = "heal",
	MOVE = "move",
	PICKUP = "pickup",
	PULL = "pull",
	RANGED_ATTACK = "ranged_attack",
	RANGED_HEAL = "ranged_heal",
	RANGED_MASS_ATTACK = "ranged_mass_attack",
	TRANSFER = "transfer",
	WITHDRAW = "withdraw"
}

export const METHOD = new Map<Function, Intent>([
	[Proto.Creep.prototype.attack, Intent.ATTACK],
	[Proto.Creep.prototype.build, Intent.BUILD],
	[Proto.Creep.prototype.drop, Intent.DROP],
	[Proto.Creep.prototype.harvest, Intent.HARVEST],
	[Proto.Creep.prototype.heal, Intent.HEAL],
	[Proto.Creep.prototype.move, Intent.MOVE],
	[Proto.Creep.prototype.moveTo, Intent.MOVE],
	[Proto.Creep.prototype.pickup, Intent.PICKUP],
	[Proto.Creep.prototype.pull, Intent.PULL],
	[Proto.Creep.prototype.rangedAttack, Intent.RANGED_ATTACK],
	[Proto.Creep.prototype.rangedHeal, Intent.RANGED_HEAL],
	[Proto.Creep.prototype.rangedMassAttack, Intent.RANGED_MASS_ATTACK],
	[Proto.Creep.prototype.transfer, Intent.TRANSFER],
	[Proto.Creep.prototype.withdraw, Intent.WITHDRAW],
	[transferEnergyAction, Intent.TRANSFER],
	[withdrawEnergyAction, Intent.WITHDRAW]
]);

export const RANGE: Record<Intent, number | undefined> = {
	[Intent.ATTACK]: 1,
	[Intent.BUILD]: 3,
	[Intent.DROP]: undefined,
	[Intent.HARVEST]: 1,
	[Intent.HEAL]: 1,
	[Intent.MOVE]: undefined,
	[Intent.PICKUP]: 1,
	[Intent.PULL]: 1,
	[Intent.RANGED_ATTACK]: 3,
	[Intent.RANGED_HEAL]: 3,
	[Intent.RANGED_MASS_ATTACK]: 3,
	[Intent.TRANSFER]: 1,
	[Intent.WITHDRAW]: 1
};

export const ACTION_PIPELINES: Intent[][] = [
	[Intent.HARVEST, Intent.ATTACK, Intent.BUILD, Intent.RANGED_HEAL, Intent.HEAL],
	[Intent.RANGED_ATTACK, Intent.RANGED_MASS_ATTACK, Intent.BUILD, Intent.RANGED_HEAL],
	[Intent.BUILD, Intent.WITHDRAW, Intent.TRANSFER, Intent.DROP]
];
