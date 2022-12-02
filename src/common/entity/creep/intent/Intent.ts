/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable max-classes-per-file */
import { Action } from "common/decisions/actions/Action";
import { ScreepsReturnCode } from "game/constants";
import { Creep } from "game/prototypes";

export abstract class Intent implements Action<Creep, ScreepsReturnCode> {
	public abstract decide(actor: Creep): Action<Creep, ScreepsReturnCode>;
	public canDoBoth(other: Action<Creep, ScreepsReturnCode>): boolean {
		if (other instanceof Intent) return Intent.canDoBoth(this, other);
		else return true;
	}
	public abstract isComplete(actor: Creep): boolean;
	public abstract execute(actor: Creep): ScreepsReturnCode | undefined;
	public static canDoBoth(a: Intent, b: Intent) {
		return this.comparePriority(a, b) === undefined;
	}
	public static comparePriority(a: Intent, b: Intent): number | undefined {
		const conflict = ACTION_PIPELINES.find(pipeline => pipeline.includes(a.type) && pipeline.includes(b.type));
		return conflict && conflict.indexOf(a.type) - conflict.indexOf(b.type);
	}
	protected abstract get type(): object;
}

export abstract class Attack extends Intent {
	protected get type(): object {
		return Attack.prototype;
	}
}

export abstract class Build extends Intent {
	protected get type(): object {
		return Build.prototype;
	}
}

export abstract class Drop extends Intent {
	protected get type(): object {
		return Drop.prototype;
	}
}

export abstract class Harvest extends Intent {
	protected get type(): object {
		return Harvest.prototype;
	}
}

export abstract class Heal extends Intent {
	protected get type(): object {
		return Heal.prototype;
	}
}

export abstract class Move extends Intent {
	protected get type(): object {
		return Move.prototype;
	}
}

export abstract class MoveTo extends Intent {
	protected get type(): object {
		return MoveTo.prototype;
	}
}

export abstract class Pickup extends Intent {
	protected get type(): object {
		return Pickup.prototype;
	}
}

export abstract class Pull extends Intent {
	protected get type(): object {
		return Pull.prototype;
	}
}

export abstract class RangedAttack extends Intent {
	protected get type(): object {
		return RangedAttack.prototype;
	}
}

export abstract class RangedHeal extends Intent {
	protected get type(): object {
		return RangedHeal.prototype;
	}
}

export abstract class RangedMassAttack extends Intent {
	protected get type(): object {
		return RangedMassAttack.prototype;
	}
}

export abstract class Transfer extends Intent {
	protected get type(): object {
		return Transfer.prototype;
	}
}

export abstract class Withdraw extends Intent {
	protected get type(): object {
		return Withdraw.prototype;
	}
}

const ACTION_PIPELINES = [
	[Harvest.prototype, Attack.prototype, Build.prototype, RangedHeal.prototype, Heal.prototype],
	[RangedAttack.prototype, RangedMassAttack.prototype, Build.prototype, RangedHeal.prototype],
	[Build.prototype, Withdraw.prototype, Transfer.prototype, Drop.prototype]
];
