import { ScreepsReturnCode } from "game/constants";
import { Creep, GameObject } from "game/prototypes";
import { State, Stateful, StateMachine } from "../../decisions/StateMachine";

export class CreepMind extends Creep implements Stateful<CreepMind, ScreepsReturnCode> {
	getState(context?: any): State<CreepMind, ScreepsReturnCode> | undefined {
		return this.state;
	}
	setState(state: State<CreepMind, ScreepsReturnCode>): void {
		this.state = state;
	}
	public target?: GameObject;
	private state?: State<CreepMind, ScreepsReturnCode>;
}
