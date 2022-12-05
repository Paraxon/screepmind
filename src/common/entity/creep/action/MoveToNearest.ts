import { Action } from "common/decisions/actions/Action";
import { PATH_COST, Predicate, Prototype, ScreepsReturnCode } from "common/Library";
import { Logger } from "common/patterns/Logger";
import { ERR_NOT_FOUND, MOVE, TERRAIN_PLAIN } from "game/constants";
import { Creep, GameObject } from "game/prototypes";
import { FindPathOptions, getObjectsByPrototype } from "game/utils";
import { CreepAction } from "./CreepAction";

export class MoveToNearest<object_t extends GameObject> extends CreepAction {
	private readonly predicate: Predicate<object_t>;
	private readonly prototype: Prototype<object_t>;
	private readonly radius: number;
	private readonly options?: FindPathOptions;
	public constructor(prototype: Prototype<object_t>, radius = 1, predicate: Predicate<object_t> = target => true, options?: FindPathOptions) {
		super(MOVE);
		this.radius = radius;
		this.prototype = prototype;
		this.predicate = predicate;
		this.options = options;
	}
	public isComplete(actor: Creep): boolean {
		const targets = getObjectsByPrototype(this.prototype).filter(this.predicate);
		if (targets.length === 0) return true;
		const nearest = actor.findClosestByRange(targets);
		return actor.getRangeTo(nearest) <= this.radius;
	}
	public decide(actor: Creep): Action<Creep, ScreepsReturnCode> {
		return new MoveToNearest(this.prototype, this.radius, this.predicate, this.options);
	}
	public execute(actor: Creep): ScreepsReturnCode | undefined {
		const targets = getObjectsByPrototype(this.prototype).filter(this.predicate);
		if (targets.length === 0) return ERR_NOT_FOUND;
		const nearest = actor.findClosestByRange(targets);
		return actor.moveTo(nearest, { ...this.options });
	}
}
