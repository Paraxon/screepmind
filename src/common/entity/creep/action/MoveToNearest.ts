import { Action } from "common/decisions/actions/Action";
import { ERR_INVALID_TARGET, ScreepsReturnCode } from "game/constants";
import { Creep, GameObject, _Constructor } from "game/prototypes";
import { getObjectsByPrototype } from "game/utils";
import { MoveTo } from "../intent/Intent";


export class MoveToNearest<object_t extends GameObject> extends MoveTo {
	private predicate?: (object: object_t) => boolean;
	private prototype: _Constructor<object_t>;
	private range: number;
	private target?: object_t;

	public constructor(prototype: _Constructor<object_t>, range = 1, predicate?: (object: object_t) => boolean) {
		super();
		this.range = range;
		this.prototype = prototype;
		this.predicate = predicate;
	}
	public isComplete(actor: Creep): boolean {
		return this.target ? actor.getRangeTo(this.target) <= this.range : false;
	}
	public decide(actor: Creep): Action<Creep, ScreepsReturnCode> {
		return new MoveToNearest(this.prototype, this.range, this.predicate);
	}
	public execute(actor: Creep): ScreepsReturnCode | undefined {
		if (!this.target) {
			const targets = getObjectsByPrototype(this.prototype);
			const matches = this.predicate ? targets.filter(this.predicate) : targets;
			this.target = actor.findClosestByRange(matches) ?? undefined;
		}
		return this.target ? actor.moveTo(this.target) : ERR_INVALID_TARGET;
	}
}
