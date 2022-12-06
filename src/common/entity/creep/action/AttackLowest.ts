import { Action } from "common/decisions/actions/Action";
import { TEAM_ENEMY } from "common/entity/team/Team";
import { Predicate, Prototype, ScreepsReturnCode, Target } from "common/Library";
import { ATTACK, ERR_NOT_FOUND } from "game/constants";
import { Creep } from "game/prototypes";
import { INTENT_RANGE } from "../CreepIntent";
import { CreepAction } from "./CreepAction";

export class AttackLowest<target_t extends Target> extends CreepAction {
	private readonly prototype: Prototype<target_t>;
	private readonly predicate: Predicate<target_t>;
	public constructor(prototype: Prototype<target_t>, predicate: Predicate<target_t> = target => true) {
		super(ATTACK);
		this.prototype = prototype;
		this.predicate = predicate;
	}
	public decide(actor: Creep): Action<Creep, number> {
		return new AttackLowest(this.prototype, this.predicate);
	}
	public execute(actor: Creep): ScreepsReturnCode | undefined {
		const targets = this.targets(actor);
		if (!targets) return ERR_NOT_FOUND;
		const lowest = targets.reduce((lowest, current) => lowest.hits! < current.hits! ? lowest : current);
		return actor.attack(lowest);
	}
	public isComplete(actor: Creep): boolean {
		return !this.targets(actor).length;
	}
	private targets(actor: Creep) {
		return actor.findInRange(
			TEAM_ENEMY.GetAll(this.prototype).filter(this.predicate),
			INTENT_RANGE[ATTACK]!);
	}
}