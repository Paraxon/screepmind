import { Classifier } from "common/classification/Classifier";
import { Role } from "common/classification/Role";
import { getObjectsByPrototype } from "game/utils";
import { Creep, StructureSpawn, _Constructor } from "game/prototypes";

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
