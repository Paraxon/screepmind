import { Creep, GameObject } from "game/prototypes";
import { Team } from "./entity/team/Team";
import { Predicate, Prototype, Reducer } from "./Library";

export class Targeter<target_t extends GameObject = GameObject> {
	private readonly team: Team;
	private readonly predicate: Predicate<target_t>;
	private readonly prototype: Prototype<target_t>;
	public constructor(team: Team, prototype: Prototype<target_t>, predicate: Predicate<target_t>, reducer?: Reducer<target_t>) {
		this.team = team;
		this.prototype = prototype;
		this.predicate = predicate;
	}
	public select() {
		return this.team.GetAll(this.prototype).filter(this.predicate);
	}
}