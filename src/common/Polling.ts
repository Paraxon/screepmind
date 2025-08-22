// import { CreepWrapper } from "./gameobject/creep/CreepWrapper";
import * as Lib from "./library";
import * as Utils from "game/utils";
import * as Proto from "game/prototypes";
import * as Func from "./Functional";

export const gameObjectTypes = [
	Proto.ConstructionSite,
	Proto.Creep,
	Proto.GameObject,
	Proto.OwnedStructure,
	Proto.Resource,
	Proto.Source,
	Proto.Structure,
	Proto.StructureContainer,
	Proto.StructureExtension,
	Proto.StructureRampart,
	Proto.StructureRoad,
	Proto.StructureSpawn,
	Proto.StructureTower,
	Proto.StructureWall
];

class Poll<object_t extends Proto.GameObject> {
	private lastUpdated: Lib.Ticks = Utils.getTicks();
	private objects: object_t[] = [];
	public constructor(private readonly prototype: Func.Prototype<object_t>) {
		this.update();
	}
	private isDirty(): boolean {
		return this.lastUpdated !== Utils.getTicks();
	}
	private update(): object_t[] {
		this.lastUpdated = Utils.getTicks();
		this.objects = Utils.getObjectsByPrototype(this.prototype);
		return this.objects;
	}
	public get(): object_t[] {
		return this.isDirty() ? this.update() : this.objects;
	}
	public toString(): string {
		return `${this.prototype.name}: count:${this.objects.length}, updated:${this.lastUpdated}`;
	}
}

class World {
	private polls = new Map<Func.Prototype<Proto.GameObject>, Poll<Proto.GameObject>>();
	constructor() {
		gameObjectTypes
			.map(prototype => prototype as Func.Prototype<Proto.GameObject>)
			.forEach(prototype => this.polls.set(prototype, new Poll<Proto.GameObject>(prototype)));
	}
	public update() {
		this.polls.forEach(poll => poll.get());
	}
	private getPoll<object_t extends Proto.GameObject>(prototype: Func.Prototype<object_t>): Poll<object_t> {
		return this.polls.get(prototype) as Poll<object_t>;
	}
	public getAll<object_t extends Proto.GameObject>(prototype: Func.Prototype<object_t>): object_t[] {
		return this.getPoll(prototype).get();
	}
}

export const world = new World();
