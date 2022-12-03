import { Action } from "common/decisions/actions/Action";
import { Prototype, ScreepsReturnCode } from "common/Library";
import { ERR_INVALID_TARGET, MOVE } from "game/constants";
import { Creep, GameObject } from "game/prototypes";
import { getObjectsByPrototype } from "game/utils";
import { CreepAction } from "./CreepAction";

export class MoveToNearest<object_t extends GameObject> extends CreepAction {
	private predicate?: (object: object_t) => boolean;
	private prototype: Prototype<object_t>;
	private range: number;
	private target?: object_t;

	public constructor(prototype: Prototype<object_t>, range = 1, predicate?: (object: object_t) => boolean) {
		super(MOVE);
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
