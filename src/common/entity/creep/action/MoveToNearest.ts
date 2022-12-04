import { Action } from "common/decisions/actions/Action";
import { Predicate, Prototype, ScreepsReturnCode } from "common/Library";
import { ERR_NOT_FOUND, MOVE } from "game/constants";
import { Creep, GameObject } from "game/prototypes";
import { FindPathOptions, getObjectsByPrototype } from "game/utils";
import { CreepAction } from "./CreepAction";

export class MoveToNearest<object_t extends GameObject> extends CreepAction {
	private predicate: Predicate<object_t>;
	private prototype: Prototype<object_t>;
	private range: number;
	private readonly options?: FindPathOptions;

	public constructor(prototype: Prototype<object_t>, range = 1, predicate: Predicate<object_t> = target => true, options?: FindPathOptions) {
		super(MOVE);
		this.range = range;
		this.prototype = prototype;
		this.predicate = predicate;
		this.options = options;
	}
	public isComplete(actor: Creep): boolean {
		const targets = getObjectsByPrototype(this.prototype).filter(this.predicate);
		if (!targets) return true;
		const nearest = actor.findClosestByRange(targets);
		return actor.getRangeTo(nearest) <= this.range;
	}
	public decide(actor: Creep): Action<Creep, ScreepsReturnCode> {
		return new MoveToNearest(this.prototype, this.range, this.predicate, this.options);
	}
	public execute(actor: Creep): ScreepsReturnCode | undefined {
		const targets = getObjectsByPrototype(this.prototype).filter(this.predicate);
		if (!targets) return ERR_NOT_FOUND;
		const nearest = actor.findClosestByRange(targets);
		return actor.moveTo(nearest, this.options);
	}
}
