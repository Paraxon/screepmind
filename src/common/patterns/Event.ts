import { getTicks } from "game/utils";

export class Event {
	public type: string;
	public tick: number;
	public parameters = new Map<string, any>();
	public constructor(type: string, tick = getTicks()) {
		this.type = type;
		this.tick = tick;
	}
	public add(key: string, value: any) {
		this.parameters.set(key, value);
		return this;
	}
}
