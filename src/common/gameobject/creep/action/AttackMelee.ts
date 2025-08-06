import Flatten from "@flatten-js/core";
import { Action } from "common/decisions/actions/Action";
import { ID, ScreepsReturnCode } from "common/Library";
import { RANGES } from "common/gameobject/creep/CreepIntent";
import { ATTACK } from "game/constants";
import { Creep, Structure } from "game/prototypes";
import { getObjectById } from "game/utils";
import { CreepAction } from "./CreepAction";

export class AttackMelee extends CreepAction {
	private readonly targetID: ID;
	public constructor(id: ID) {
		super(ATTACK);
		this.targetID = id;
	}
	public decide(actor: Creep): Action<Creep, ScreepsReturnCode> {
		return new AttackMelee(this.targetID);
	}
	public isComplete(actor: Creep): boolean {
		const target = getObjectById(this.targetID as string) as Creep | Structure;
		return (target.hits ?? 0) <= 0 || actor.getRangeTo(target) > RANGES[ATTACK]!;
	}
	public execute(actor: Creep): ScreepsReturnCode | undefined {
		this.emote(actor);
		const target = getObjectById(this.targetID as string) as Creep | Structure;
		return actor.attack(target);
	}
}
