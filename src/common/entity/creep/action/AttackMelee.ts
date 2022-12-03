import Flatten from "@flatten-js/core";
import { Action } from "common/decisions/actions/Action";
import { ID, ScreepsReturnCode } from "common/Library";
import { Creep, Structure } from "game/prototypes";
import { getObjectById } from "game/utils";
import { Attack } from "../intent/Intent";

export class AttackMelee extends Attack {
	private targetID: ID;
	public constructor(id: ID) {
		super();
		this.targetID = id;
	}
	public decide(actor: Creep): Action<Creep, ScreepsReturnCode> {
		return new AttackMelee(this.targetID);
	}
	public isComplete(actor: Creep): boolean {
		const target = getObjectById(this.targetID as string) as Creep | Structure;
		return (target.hits ?? 0) <= 0 || actor.getRangeTo(target) > 1;
	}
	public execute(actor: Creep): ScreepsReturnCode | undefined {
		const target = getObjectById(this.targetID as string) as Creep | Structure;
		return actor.attack(target);
	}
}