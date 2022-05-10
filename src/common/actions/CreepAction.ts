/* eslint-disable max-classes-per-file */
import { ERR_NOT_FOUND, OK, ScreepsReturnCode } from "game/constants";
import { Action } from "./Action";
import { CreepMind } from "arena_alpha_spawn_and_swamp/main";
import { getObjectsByPrototype } from "game";
import { Move } from "./Intent";
import { StructureContainer } from "game/prototypes";

export class TargetContainer implements Action<CreepMind, ScreepsReturnCode> {
	private complete = false;
	public execute(actor: CreepMind): ScreepsReturnCode | undefined {
		const containers = getObjectsByPrototype(StructureContainer).filter(container => container.store.energy > 0);
		if (containers.length === 0) return ERR_NOT_FOUND;
		actor.target = actor.findClosestByRange(containers);
		this.complete = true;
		return OK;
	}
	public canDoBoth(other: Action<CreepMind, ScreepsReturnCode>): boolean {
		return true;
	}
	public isComplete(): boolean {
		return this.complete;
	}
}

export class MoveToTarget extends Move {
	public isComplete(actor: CreepMind): boolean {
		return actor.target !== undefined && actor.target !== undefined && actor.getRangeTo(actor.target!) === 1;
	}
	public execute(actor: CreepMind): ScreepsReturnCode | undefined {
		return actor.moveTo(actor.target!);
	}
}
