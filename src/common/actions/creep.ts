/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable max-classes-per-file */
import { Action } from "./action";
import { Creep } from "game/prototypes";
import { DecisionMaker } from "common/decisions/decision-maker";
import { ScreepsReturnCode } from "game/constants";

export abstract class CreepAction implements Action<Creep, ScreepsReturnCode>, DecisionMaker<Creep, ScreepsReturnCode> {
	public abstract execute(actor: Creep): ScreepsReturnCode;
	public decide(actor: Creep): Action<Creep, ScreepsReturnCode> | undefined {
		return this;
	}
	public static canDoBoth(a: CreepAction, b: CreepAction) {
		return this.comparePriority(a, b) === undefined;
	}
	public static comparePriority(a: CreepAction, b: CreepAction): number | undefined {
		const conflict = ACTION_PIPELINES.find(pipeline => pipeline.includes(a.type) && pipeline.includes(b.type));
		return conflict && conflict.indexOf(a.type) - conflict.indexOf(b.type);
	}
	protected abstract get type(): object;
}

export abstract class Attack extends CreepAction {
	protected get type(): object {
		return Attack.prototype;
	}
}

export abstract class Build extends CreepAction {
	protected get type(): object {
		return Build.prototype;
	}
}

export abstract class Drop extends CreepAction {
	protected get type(): object {
		return Drop.prototype;
	}
}

export abstract class Harvest extends CreepAction {
	protected get type(): object {
		return Harvest.prototype;
	}
}

export abstract class Heal extends CreepAction {
	protected get type(): object {
		return Heal.prototype;
	}
}

export abstract class Move extends CreepAction {
	protected get type(): object {
		return Move.prototype;
	}
}

export abstract class MoveTo extends CreepAction {
	protected get type(): object {
		return MoveTo.prototype;
	}
}

export abstract class Pickup extends CreepAction {
	protected get type(): object {
		return Pickup.prototype;
	}
}

export abstract class Pull extends CreepAction {
	protected get type(): object {
		return Pull.prototype;
	}
}

export abstract class RangedAttack extends CreepAction {
	protected get type(): object {
		return RangedAttack.prototype;
	}
}

export abstract class RangedHeal extends CreepAction {
	protected get type(): object {
		return RangedHeal.prototype;
	}
}

export abstract class RangedMassAttack extends CreepAction {
	protected get type(): object {
		return RangedMassAttack.prototype;
	}
}

export abstract class Transfer extends CreepAction {
	protected get type(): object {
		return Transfer.prototype;
	}
}

export abstract class Withdraw extends CreepAction {
	protected get type(): object {
		return Withdraw.prototype;
	}
}

const ACTION_PIPELINES: any[][] = [
	[Harvest.prototype, Attack.prototype, Build.prototype, RangedHeal.prototype, Heal.prototype],
	[RangedAttack.prototype, RangedMassAttack.prototype, Build.prototype, RangedHeal.prototype],
	[Build.prototype, Withdraw.prototype, Transfer.prototype, Drop.prototype]
];
