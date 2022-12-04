import { ATTACK, BODYPART_HITS, HEAL, RANGED_ATTACK } from "game/constants";
import { BodyPartType, Creep } from "game/prototypes";

export class Influence {
	public bodyparts = new Map<BodyPartType, number>();
	public evaluate(creep: Creep): number {
		return creep.body.reduce((sum, part) => sum
			+ (part.hits / BODYPART_HITS)
			* (this.bodyparts.get(part.type) ?? 0), 0)
			* (creep.my ? 1 : -1);
	}
}

export const influence = new Influence();
influence.bodyparts.set(ATTACK, 1);
influence.bodyparts.set(RANGED_ATTACK, 1);
influence.bodyparts.set(HEAL, 1);