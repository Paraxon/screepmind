import { Condition } from "common/decisions/Condition";
import { Prototype } from "common/Library";
import { GameObject } from "game/prototypes";
import { Team } from "../team/Team";

export class TeamHasAny<object_t extends GameObject> implements Condition<GameObject> {
	private readonly team: Team;
	private readonly prototype: Prototype<object_t>;
	private readonly predicate: (actor: GameObject, object: object_t) => boolean;
	public constructor(team: Team, prototype: Prototype<object_t>, predicate: (actor: GameObject, object: object_t) => boolean = (actor) => true) {
		this.team = team;
		this.prototype = prototype;
		this.predicate = predicate;
	}
	evaluate(actor: GameObject): boolean {
		return this.team.GetAll(this.prototype).some(this.predicate.bind(null, actor));
	}
}