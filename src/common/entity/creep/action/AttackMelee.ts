import Flatten from "@flatten-js/core";
import { Action } from "common/decisions/actions/Action";
import { ScreepsReturnCode } from "game/constants";
import { Creep, Id, Structure } from "game/prototypes";
import { getObjectById } from "game/utils";
import { Attack } from "../intent/Intent";

export class AttackMelee extends Attack {
	private targetID: Id<Creep | Structure>;
	public constructor(id: Id<Creep | Structure>) {
		super();
		this.targetID = id;
	}
	public decide(actor: Creep): Action<Creep, ScreepsReturnCode> {
		return new AttackMelee(this.targetID);
	}
	public isComplete(actor: Creep): boolean {
		const target = getObjectById(this.targetID) as Creep | Structure;
		return (target.hits ?? 0) <= 0 || actor.getRangeTo(target) > 1;
	}
	public execute(actor: Creep): ScreepsReturnCode | undefined {
		const target = getObjectById(this.targetID) as Creep | Structure;
		return actor.attack(target);
	}
}