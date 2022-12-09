import { Creep, GameObject, Position } from "game/prototypes";
import { Team } from "./entity/team/Team";
import { Distance, Predicate, Prototype, Reducer } from "./Library";

export class Targeter<target_t extends GameObject = GameObject> {
	private readonly team: Team;
	private readonly predicate: Predicate<target_t>;
	private readonly prototype: Prototype<target_t>;
	public constructor(team: Team, prototype: Prototype<target_t>, predicate: Predicate<target_t>, reducer?: Reducer<target_t>) {
		this.team = team;
		this.prototype = prototype;
		this.predicate = predicate;
	}
	public all(): target_t[] {
		return this.team.GetAll(this.prototype).filter(this.predicate);
	}
	public best(reducer: (best: target_t, current: target_t) => target_t): target_t | undefined {
		return this.all().reduce(reducer);
	}
	public closestTo(actor: GameObject): target_t | undefined {
		return actor.findClosestByRange(this.all());
	}
	public inRange(actor: GameObject, radius: Distance): target_t[] {
		return actor.findInRange(this.all(), radius);
	}
}