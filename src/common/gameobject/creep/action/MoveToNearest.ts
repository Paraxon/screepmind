import { Action } from "common/decisions/actions/Action";
import { Targeter } from "common/gameobject/Targeter";
import { Distance } from "common/Library";
import { ERR_NOT_FOUND, MOVE } from "game/constants";
import { Creep, GameObject } from "game/prototypes";
import { FindPathOptions } from "game/utils";
import { ScreepsReturnCode } from "../../ReturnCode";
import { CreepAction } from "./CreepAction";
import { Logger } from "common/patterns/Logger";

export class MoveToNearest<object_t extends GameObject> extends CreepAction {
	private readonly radius: Distance;
	private readonly _options?: FindPathOptions;
	private readonly targeter: Targeter<object_t>;
	public constructor(targeter: Targeter<object_t>, radius = 1, options: FindPathOptions = {}) {
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
		this.emote(actor);
		const targets = this.targeter.all();
		if (!targets.length) return ERR_NOT_FOUND;
		const nearest = actor.findClosestByRange(targets);
		return actor.moveTo(nearest, this.options);
	}
	private get options(): FindPathOptions {
		return { ...this._options };
	}
}
