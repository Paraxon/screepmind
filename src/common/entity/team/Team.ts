import Flatten from "@flatten-js/core";
import { builder, classifier } from "arena_alpha_spawn_and_swamp/main";
import { Action } from "common/decisions/actions/Action";
import { BodyRatio } from "common/BodyRatio";
import { Classifier } from "common/classification/Classifier";
import { Role } from "common/classification/Role";
import { getObjectsByPrototype } from "game";
import { BuildableStructure, ERR_NOT_FOUND, OK, ScreepsReturnCode } from "game/constants";
import { ConstructionSite, Creep, OwnedStructure, Structure, StructureConstant, StructureSpawn, _Constructor } from "game/prototypes";
import { createConstructionSite } from "game/utils";

export interface OwnedGameObject {
	my: boolean | undefined;
}

export class Team {
	my: boolean | undefined;
	public constructor(my: boolean | undefined = true) {
		this.my = my;
	}
	public GetAll<object_t extends OwnedGameObject>(prototype: _Constructor<object_t>): object_t[] {
		return getObjectsByPrototype(prototype).filter(object => object.my === this.my);
	}
	public GetFirst<object_t extends OwnedGameObject>(prototype: _Constructor<object_t>): object_t | undefined {
		return getObjectsByPrototype(prototype).find(object => object.my === this.my);
	}
	public get Energy(): number {
		return this.GetFirst(StructureSpawn)?.store.energy ?? 0;
	}
	public get Creeps(): Creep[] {
		return this.GetAll(Creep);
	}
	public FindCreeps(classifier: Classifier<Creep, Role>, role: Role, membership: number): Creep[] {
		return this.Creeps.filter(creep => classifier.classify(creep).test(role) >= membership);
	}
}
