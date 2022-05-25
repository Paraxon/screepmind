import { ATTACK, BodyPartConstant, BODYPART_HITS, HEAL, RANGED_ATTACK } from "game/constants";
import { Creep } from "game/prototypes";

export class Influence {
	public bodyparts = new Map<BodyPartConstant, number>();
	public evaluate(creep: Creep): number {
		return creep.body.reduce((sum, part) => sum
			+ (part.hits / BODYPART_HITS)
			* (this.bodyparts.get(part.type) ?? 0), 0)
			* (creep.my ? 1 : -1);
	}
}

export const Power = new Influence();
Power.bodyparts.set(ATTACK, 1);
Power.bodyparts.set(RANGED_ATTACK, 1);
Power.bodyparts.set(HEAL, 1);