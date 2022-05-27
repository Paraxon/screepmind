import { Action } from "common/actions/Action";
import { BodyRatio } from "common/BodyRatio";
import { getObjectsByPrototype } from "game";
import { ERR_NOT_FOUND, ScreepsReturnCode } from "game/constants";
import { Creep, StructureSpawn } from "game/prototypes";

export class Team {
	my: boolean | undefined;
	public constructor(my: boolean | undefined = true) {
		this.my = my;
	}
	get Energy(): number {
		return getObjectsByPrototype(StructureSpawn).find(spawn => spawn.my === this.my)?.store.energy ?? 0;
	}
	get Creeps(): Creep[] {
		return getObjectsByPrototype(Creep).filter(creep => creep.my === this.my);
	}
}

export class SpawnCreep implements Action<Team, ScreepsReturnCode> {
	flag = false;
	ratio: BodyRatio;
	public constructor(ratio: BodyRatio) {
		this.ratio = ratio;
		this.flag = true;
	}
	public decide(actor: Team): Action<Team, ScreepsReturnCode> {
		return this;
	}
	public execute(actor: Team): ScreepsReturnCode | undefined {
		return getObjectsByPrototype(StructureSpawn).find(spawn => spawn.my)?.spawnCreep(this.ratio.spawn).error;
	}
	public canDoBoth(other: Action<Team, ScreepsReturnCode>): boolean {
		throw new Error("Method not implemented.");
	}
	public isComplete(actor: Team): boolean {
		return this.flag;
	}
}