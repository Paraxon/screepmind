import { Action } from "common/decisions/actions/Action";
import { ScreepsResult } from "common/gameobject/Result";
import * as Consts from "game/constants";
import * as Proto from "game/prototypes";
import * as Utils from "game/utils";
import * as Intent from "../CreepIntent";
import { CreepAction } from "./CreepAction";

export class BoundAction<target_t> extends CreepAction {
	private action: (target: target_t) => ScreepsResult;
	private selector: (actor: Proto.Creep) => target_t;
	public constructor(action: (target: target_t) => ScreepsResult, selector: (actor: Proto.Creep) => target_t) {
		super(Intent.METHOD.get(action)!);
		this.action = action;
		this.selector = selector;
	}
	public decide(actor: Proto.Creep): Action<Proto.Creep, ScreepsResult> {
		return this;
	}
	public execute(actor: Proto.Creep): ScreepsResult | undefined {
		this.emote(actor);
		return this.action.call(actor, this.selector(actor));
	}
	public isComplete(actor: Proto.Creep): boolean {
		return this.selector(actor) === undefined;
	}
}

const attack = new BoundAction(
	Proto.Creep.prototype.attack,
	(actor: Proto.Creep) => Utils.getObjectsByPrototype(Proto.Creep)[0]
);
const build = new BoundAction(
	Proto.Creep.prototype.build,
	(actor: Proto.Creep) => Utils.getObjectsByPrototype(Proto.ConstructionSite)[0]
);
const harvest = new BoundAction(
	Proto.Creep.prototype.harvest,
	(actor: Proto.Creep) => Utils.getObjectsByPrototype(Proto.Source)[0]
);
const heal = new BoundAction(
	Proto.Creep.prototype.heal,
	(actor: Proto.Creep) => Utils.getObjectsByPrototype(Proto.Creep)[0]
);
const move = new BoundAction<Utils.Direction>(Proto.Creep.prototype.move, (actor: Proto.Creep) => Consts.TOP);
const pickup = new BoundAction(
	Proto.Creep.prototype.pickup,
	(actor: Proto.Creep) => Utils.getObjectsByPrototype(Proto.Resource)[0]
);
const pull = new BoundAction(
	Proto.Creep.prototype.pull,
	(actor: Proto.Creep) => Utils.getObjectsByPrototype(Proto.Creep)[0]
);
const rangedAttack = new BoundAction(
	Proto.Creep.prototype.rangedAttack,
	(actor: Proto.Creep) => Utils.getObjectsByPrototype(Proto.Creep)[0]
);
const rangedHeal = new BoundAction(
	Proto.Creep.prototype.rangedHeal,
	(actor: Proto.Creep) => Utils.getObjectsByPrototype(Proto.Creep)[0]
);
const rangedMassAttack = new BoundAction(Proto.Creep.prototype.rangedMassAttack, (actor: Proto.Creep) => undefined);
// transfer, withdraw, drop, and moveTo are not implemented as BoundActions
