import { BinaryPredicate, Reducer, SingleTargetIntent } from "common/library";
import { Action } from "common/decisions/actions/Action";
import { ScreepsResult } from "common/gameobject/Result";
import { Targeter } from "common/gameobject/Targeter";
import { ATTACK, ERR_NOT_FOUND } from "game/constants";
import { Creep, GameObject } from "game/prototypes";
import { CreepAction } from "./CreepAction";
import { INTENT_METHODS, Intent } from "../CreepIntent";

export class SingleTargetAction<target_t extends GameObject> extends CreepAction {
	private readonly targeter: Targeter<target_t>;
	private readonly reducer: Reducer<target_t>;
	private readonly method: SingleTargetIntent;
	private readonly predicate: BinaryPredicate<Creep, target_t>;
	public constructor(
		targeter: Targeter<target_t>,
		reducer: Reducer<target_t>,
		method: SingleTargetIntent,
		predicate: BinaryPredicate<Creep, target_t>
	) {
		super(INTENT_METHODS[method.name]);
		this.targeter = targeter;
		this.reducer = reducer;
		this.method = method;
		this.predicate = predicate;
	}
	public decide(actor: Creep): Action<Creep, ScreepsResult> {
		return this;
	}
	public execute(actor: Creep): ScreepsResult | undefined {
		const targets = this.targeter.all();
		if (!targets.length) return ERR_NOT_FOUND;
		const best = targets.reduce(this.reducer);
		return this.method.call(actor, best);
	}
	public isComplete(actor: Creep): boolean {
		const targets = this.targeter.all();
		return !targets.length || this.predicate(actor, targets.reduce(this.reducer));
	}
}
