import { Action } from "common/decisions/actions/Action";
import { Distance, Predicate, Prototype, ScreepsReturnCode } from "common/Library";
import { Targeter } from "common/gameobject/Targeter";
import { ERR_NOT_FOUND, MOVE } from "game/constants";
import { Creep, GameObject } from "game/prototypes";
import { FindPathOptions, getObjectsByPrototype } from "game/utils";
import { CreepAction } from "./CreepAction";

export class MoveToNearest<object_t extends GameObject> extends CreepAction {
	private readonly radius: Distance;
	private readonly _options?: FindPathOptions;
	private readonly targeter: Targeter<object_t>;
	public constructor(targeter: Targeter<object_t>, radius = 1, options?: FindPathOptions) {
		super(MOVE);
		this.radius = radius;
		this.targeter = targeter;
		this._options = { ...options };
	}
	public isComplete(actor: Creep): boolean {
		const targets = this.targeter.all();
		if (!targets.length) return true;
		const nearest = actor.findClosestByRange(targets);
		return actor.getRangeTo(nearest) <= this.radius;
	}
	public decide(actor: Creep): Action<Creep, ScreepsReturnCode> {
		return new MoveToNearest(this.targeter, this.radius, this._options);
	}
	public execute(actor: Creep): ScreepsReturnCode | undefined {
		const targets = this.targeter.all();
		if (!targets.length) return ERR_NOT_FOUND;
		const nearest = actor.findClosestByRange(targets);
		return actor.moveTo(nearest, this.options);
	}
	private get options(): FindPathOptions {
		return { ...this._options };
	}
}