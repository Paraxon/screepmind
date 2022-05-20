import { Logger } from "common/debug/Logger";
import { getTicks } from "game/utils";

export class Event {
	public type: string;
	public tick: number;
	public parameters = new Map<string, any>;
	public constructor(type: string, tick = getTicks()) {
		this.type = type;
		this.tick = tick;
	}
	public add(key: string, value: any) {
		this.parameters.set(key, value);
		return this;
	}
}

export class Dispatch {
	private static queue: Event[] = [];
	private static subscribers = new Map<string, Set<Subscriber>>();
	private static subscribe(event: Event, Subscriber: Subscriber) {
		if (!this.subscribers.has(event.type))
			this.subscribers.set(event.type, new Set<Subscriber>());
		this.subscribers.get(event.type)!.add(Subscriber);
	}
	public static trigger(type: string, future = 0): Event {
		const tick = getTicks() + future;
		Logger.log("event", `Queueing event ${type} for tick ${tick}`);
		const index = this.queue.findIndex(e => e.tick > tick);
		const event = new Event(type, tick);
		this.queue.splice(index, 0, event);
		return event;
	}
	public static update() {
		const current = this.queue.findIndex(e => e.tick <= getTicks());
		this.queue.slice(0, current).forEach(e => this.dispatch(e));
		this.queue.splice(0, current);
	}
	public static dispatch(event: Event) {

	}
}

export interface Subscriber {

}