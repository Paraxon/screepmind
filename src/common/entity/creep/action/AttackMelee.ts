import { Action } from "common/decisions/actions/Action";
import { Logger } from "common/patterns/Logger";
import { Verbosity } from "common/patterns/Verbosity";
import { CreepActionReturnCode, ERR_NOT_IN_RANGE, ScreepsReturnCode } from "game/constants";
import { Creep, GameObject, Id, Structure, StructureConstant } from "game/prototypes";
import { getObjectById } from "game/utils";
import { Attack } from "../Intent";


export class AttackMelee extends Attack {
	private targetID: Id<GameObject>;
	public constructor(target: Creep | Structure) {
		super();
		this.targetID = target.id;
	}
	public decide(actor: Creep): Action<Creep, ScreepsReturnCode> {
		return this;
	}
	public isComplete(actor: Creep): boolean {
		const target = getObjectById(this.targetID)! as Creep | Structure;
		return target.hits! > 0;
	}
	public execute(actor: Creep): ScreepsReturnCode | undefined {
		Logger.log('action', `creep ${actor.id} is attacking object ${this.targetID}`, Verbosity.Trace);
		const target = getObjectById(this.targetID)!;
		let result: ScreepsReturnCode | undefined = actor.attack(target as Creep | Structure);
		if (result === ERR_NOT_IN_RANGE)
			result = actor.moveTo(target);
		return result;
	}
}