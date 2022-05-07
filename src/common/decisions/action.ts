import { ATTACK, CreepActionReturnCode, OK, ScreepsReturnCode } from "game/constants";
import { Creep } from "game/prototypes";
import { Action, DecisionMaker } from "./decision-tree";

export abstract class CreepAction implements Action<Creep, ScreepsReturnCode>, DecisionMaker<Creep> {
	abstract execute(actor: Creep): ScreepsReturnCode;
	decide(actor: Creep): Action<Creep, ScreepsReturnCode> | undefined {
		return this;
	}
	static canDoBoth(a: CreepAction, b: CreepAction) {
		return !ACTION_PIPELINES.some(pipeline => pipeline.includes(Object.getPrototypeOf(a)) && pipeline.includes(Object.getPrototypeOf(b)));
	}
	static comparePriority(a: CreepAction, b: CreepAction): number | undefined {
		const pipeline = ACTION_PIPELINES.find(pipeline => pipeline.includes(Object.getPrototypeOf(a)) && pipeline.includes(Object.getPrototypeOf(b)));
		return pipeline && pipeline.indexOf(Object.getPrototypeOf(a)) - pipeline.indexOf(Object.getPrototypeOf(b));
	}
}

export class Attack extends CreepAction {
	execute(actor: Creep): ScreepsReturnCode {
		throw new Error("Method not implemented.");
	}
}

export class Build extends CreepAction {
	execute(actor: Creep): ScreepsReturnCode {
		throw new Error("Method not implemented.");
	}
}

export class Drop extends CreepAction {
	execute(actor: Creep): ScreepsReturnCode {
		throw new Error("Method not implemented.");
	}
}

export class Harvest extends CreepAction {
	execute(actor: Creep): ScreepsReturnCode {
		throw new Error("Method not implemented.");
	}
}

export class Heal extends CreepAction {
	execute(actor: Creep): ScreepsReturnCode {
		throw new Error("Method not implemented.");
	}
}

export class Move extends CreepAction {
	execute(actor: Creep): ScreepsReturnCode {
		throw new Error("Method not implemented.");
	}
}

export class MoveTo extends CreepAction {
	execute(actor: Creep): ScreepsReturnCode {
		throw new Error("Method not implemented.");
	}
}

export class Pickup extends CreepAction {
	execute(actor: Creep): ScreepsReturnCode {
		throw new Error("Method not implemented.");
	}
}

export class Pull extends CreepAction {
	execute(actor: Creep): ScreepsReturnCode {
		throw new Error("Method not implemented.");
	}
}

export class RangedAttack extends CreepAction {
	execute(actor: Creep): ScreepsReturnCode {
		throw new Error("Method not implemented.");
	}
}

export class RangedHeal extends CreepAction {
	execute(actor: Creep): ScreepsReturnCode {
		throw new Error("Method not implemented.");
	}
}

export class RangedMassAttack extends CreepAction {
	execute(actor: Creep): ScreepsReturnCode {
		throw new Error("Method not implemented.");
	}
}

export class Transfer extends CreepAction {
	execute(actor: Creep): ScreepsReturnCode {
		throw new Error("Method not implemented.");
	}
}

export class Withdraw extends CreepAction {
	execute(actor: Creep): ScreepsReturnCode {
		throw new Error("Method not implemented.");
	}
}

const ACTION_PIPELINES = [
	[Harvest.prototype, Attack.prototype, Build.prototype, RangedHeal.prototype, Heal.prototype],
	[RangedAttack.prototype, RangedMassAttack.prototype, Build.prototype, RangedHeal.prototype],
	[Build.prototype, Withdraw.prototype, Transfer.prototype, Drop.prototype],
];
