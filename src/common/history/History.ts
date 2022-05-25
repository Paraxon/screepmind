import { System } from "arena_alpha_spawn_and_swamp/main";
import { CreepMind } from "common/decisions/CreepMind";
import { getObjectById, getTicks } from "game";
import { CREEP_SPAWN_TIME } from "game/constants";
import { Creep, GameObject, Id, StructureSpawn } from "game/prototypes";
import { getObjectsByPrototype } from "game/utils";
import { Hooks } from "../patterns/EventQueue";

export abstract class Memo<object_t extends GameObject> {
	protected id: Id<object_t>;
	protected object: object_t;
	public constructor(object: object_t) {
		this.object = object;
		this.id = object.id;
	}
	public abstract update(): void;
}

export class CreepMemo extends Memo<Creep> {
	public hits = new Map<number, number>();

	public constructor(creep: Creep) {
		super(creep);
		this.hits.set(getTicks(), creep.hits);
		const spawn = getObjectsByPrototype(StructureSpawn).find(
			spawn => spawn.my === creep.my && spawn.x === creep.x && spawn.y === creep.y);
		if (spawn) {
			const spawnTime = creep.body.length * CREEP_SPAWN_TIME - 1;
			Hooks.trigger("onCreepSpawning").add("creep", creep).add("spawn", spawn).add("spawnTime", spawnTime);
			Hooks.trigger("onCreepSpawned", spawnTime).add("creep", creep).add("spawn", spawn);
		}
		else
			Hooks.trigger("onCreepFound").add("creep", creep);
	}
	public update() {
		const previous = Array.from(this.hits.values()).at(-1);
		if (previous !== this.object.hits) {
			Hooks.trigger("onCreepHitsChanged").add("old", previous).add("new", this.object.hits);
			if (!this.object.hits) Hooks.trigger("onCreepDeath").add("creep", this.object);
			this.hits.set(getTicks(), this.object.hits);
		}
	}
}

export class History {
	public static initialize(): void {
		throw new Error("Method not implemented.");
	}
	public static creeps = new Map<Id<Creep>, CreepMemo>();
	public static update() {
		getObjectsByPrototype(Creep).forEach(creep => this.creeps.has(creep.id)
			? this.creeps.get(creep.id)!.update()
			: this.creeps.set(creep.id, new CreepMemo(creep)));
	}
}