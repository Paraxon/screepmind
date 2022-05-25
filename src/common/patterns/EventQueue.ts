import { Logger } from "common/patterns/Logger";
import { Verbosity } from "common/patterns/Verbosity";
import { getTicks } from "game/utils";
import { Event } from "./Event";

type callback_t = (event: Event) => void;

export class EventQueue {
	private static queue = new Array<Event>();
	private static subscribers = new Map<string, Set<callback_t>>();
	public static subscribe(type: string, Subscriber: callback_t) {
		if (!this.subscribers.has(type))
			this.subscribers.set(type, new Set<callback_t>());
		this.subscribers.get(type)!.add(Subscriber);
	}
	public static trigger(type: string, future = 0): Event {
		const targetTick = getTicks() + future;
		const index = this.queue.findIndex(event => event.tick > targetTick);
		const position = index === -1 ? this.queue.length : index;
		const event = new Event(type, targetTick);
		this.queue.splice(position, 0, event);
		Logger.log("event", `Queueing ${type} for tick ${targetTick} in position ${position} of ${this.queue.length}`, Verbosity.Trace);
		return event;
	}
	public static update() {
		const now = getTicks();
		const index = this.queue.findIndex(event => event.tick > now);
		const count = index === -1 ? this.queue.length : index;
		Logger.log("event", `Dispatching ${count} of ${this.queue.length} events`, Verbosity.Trace);
		this.queue.splice(0, count).forEach(event => this.dispatch(event));
	}
	public static dispatch(event: Event) {
		if (event.tick !== getTicks())
			Logger.log("event", `Dispatching ${event.type} on wrong tick ${getTicks()} instead of target tick ${event.tick}`, Verbosity.Warning);
		else
			Logger.log("event", `Dispatching ${event.type}`, Verbosity.Trace);
		this.subscribers.get(event.type)?.forEach(callback => callback(event));
	}
	public static initialize(): void { }
}

EventQueue.subscribe("onCreepSpawning", (event: Event) => Logger.log("event", `Creep spawning: ${event.parameters.get("creep").id}`));
EventQueue.subscribe("onCreepFound", (event: Event) => Logger.log("event", `Creep found: ${event.parameters.get("creep").id}`));