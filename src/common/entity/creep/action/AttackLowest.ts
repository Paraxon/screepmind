import { Action } from "common/decisions/actions/Action";
import { TEAM_ENEMY } from "common/entity/team/Team";
import { Predicate, Prototype } from "common/Library";
import { Logger } from "common/patterns/Logger";
import { ATTACK, ERR_NOT_IN_RANGE } from "game/constants";
import { Creep, GameObject, OwnedStructure, Structure } from "game/prototypes";
import { INTENT_RANGE } from "../CreepIntent";
import { CreepAction } from "./CreepAction";

export class AttackLowest<target_t extends Creep | Structure> extends CreepAction {
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
	public execute(actor: Creep): number | undefined {
		Logger.log('action', `actor ${actor.id} is selecting an attack target`);
		const targets = actor.findInRange(TEAM_ENEMY.GetAll(this.prototype), INTENT_RANGE[ATTACK]!);
		if (!targets) return ERR_NOT_IN_RANGE;
		const lowest = targets
			.filter(target => target.hits)
			.filter(this.predicate)
			.reduce((lowest, current) => lowest.hits! < current.hits! ? lowest : current);
		Logger.log('action', `creep ${actor.id} is attacking target ${lowest.id}`);
		return actor.attack(lowest);
	}
	public isComplete(actor: Creep): boolean {
		const targets = actor.findInRange(TEAM_ENEMY.GetAll(this.prototype), INTENT_RANGE[ATTACK]!);
		return targets.length != 0;
	}

}