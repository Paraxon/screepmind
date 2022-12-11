import { Action } from "common/decisions/actions/Action";
import { DecisionMaker } from "common/decisions/DecisionMaker";
import { BodyRatio } from "common/gameobject/creep/BodyRatio";
import { ScreepsReturnCode } from "common/gameobject/ReturnCode";
import { hauler, kiter, raider } from "common/gameobject/creep/Roles";
import { CARRY, WORK, ATTACK, TERRAIN_SWAMP, RANGED_ATTACK } from "game/constants";
import { Creep } from "game/prototypes";
import { getTicks } from "game/utils";

export class Role implements DecisionMaker<Creep, ScreepsReturnCode> {
	public readonly name: string;
	public readonly body: BodyRatio;
	private readonly popMin: number;
	private readonly popSlope: number;
	private readonly ai: DecisionMaker<Creep, ScreepsReturnCode>;
	public constructor(name: string, body: BodyRatio, ai: DecisionMaker<Creep, ScreepsReturnCode>, popMin: number, spawnPeriod: number) {
		this.name = name;
		this.body = body;
		this.ai = ai;
		this.popMin = popMin;
		this.popSlope = 1 / spawnPeriod;
	}
	public expectedPop(atTick: number = getTicks()) {
		return Math.floor(this.popSlope * atTick + this.popMin);
	}
	public decide(actor: Creep): Action<Creep, ScreepsReturnCode> | undefined {
		return this.ai.decide(actor);
	}
}
export const roles: Role[] = [
	new Role("raider", new BodyRatio().with(ATTACK).moveEvery(TERRAIN_SWAMP), raider, 0, 33),
	new Role("kiter", new BodyRatio().with(RANGED_ATTACK).moveEvery(TERRAIN_SWAMP), kiter, 0, 50),
	new Role("hauler", new BodyRatio().with(CARRY).moveEvery(), hauler, 2, 100),
	new Role("builder", new BodyRatio().with(CARRY).with(WORK).moveEvery(), raider, 1, 200)
];
