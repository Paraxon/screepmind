import { Creep } from "game/prototypes";
import { Dispatch } from "./Events";

export class CreepMemo {
	public creep: Creep;
	public hits: number;

	public constructor(creep: Creep) {
		this.creep = creep;
		this.hits = creep.hits;
	}
	public update(creep: Creep) {
		if (creep.hits !== this.hits) {
			Dispatch.trigger("onCreepHitsChanged").add("old", this.hits).add("new", creep.hits);
			this.hits = creep.hits;
		}
	}
}

export class History {
	public update() {

	}
}