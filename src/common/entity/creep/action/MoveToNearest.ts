import { Action } from "common/decisions/actions/Action";
import { Distance, Predicate, Prototype, ScreepsReturnCode } from "common/Library";
import { ERR_NOT_FOUND, MOVE } from "game/constants";
import { Creep, GameObject } from "game/prototypes";
import { FindPathOptions, getObjectsByPrototype } from "game/utils";
import { CreepAction } from "./CreepAction";

export class MoveToNearest<object_t extends GameObject> extends CreepAction {
	private readonly predicate: Predicate<object_t>;
	private readonly prototype: Prototype<object_t>;
	private readonly radius: Distance;
	private readonly _options?: FindPathOptions;
	public constructor(prototype: Prototype<object_t>, radius = 1, predicate: Predicate<object_t> = target => true, options?: FindPathOptions) {
		super(MOVE);
		this.radius = radius;
		this.prototype = prototype;
		this.predicate = predicate;
		this._options = { ...options };
	}
	public isComplete(actor: Creep): boolean {
		const targets = this.getTargets();
		if (!targets.length) return true;
		const nearest = actor.findClosestByRange(targets);
		return actor.getRangeTo(nearest) <= this.radius;
	}
	public decide(actor: Creep): Action<Creep, ScreepsReturnCode> {
		return new MoveToNearest(this.prototype, this.radius, this.predicate, this._options);
	}
	public execute(actor: Creep): ScreepsReturnCode | undefined {
		const targets = this.getTargets();
		if (!targets.length) return ERR_NOT_FOUND;
		const nearest = actor.findClosestByRange(targets);
		return actor.moveTo(nearest, this.options);
	}
	private getTargets() {
		return getObjectsByPrototype(this.prototype).filter(this.predicate);
	}
	private get options(): FindPathOptions {
		return { ...this._options };
	}
}
