import * as Proto from "game/prototypes";
import * as Result from "../../Result";
import * as Intent from "../CreepIntent";
import * as Consts from "game/constants";
import { CreepAction } from "./CreepAction";
import * as Draw from "game/visual";

export type Targeter<actor_t, target_t> = (actor: actor_t) => target_t[];
export type Selector<actor_t, target_t> = (actor: actor_t, targets: target_t[]) => target_t | undefined;

export class BoundAction<target_t extends Proto.GameObject> extends CreepAction {
	public constructor(
		protected action: (target: target_t) => Result.ScreepsResult,
		protected targeter: Targeter<Proto.Creep, target_t>,
		protected selector?: Selector<Proto.Creep, target_t>,
		protected complete?: (actor: Proto.Creep, target: target_t) => boolean
	) {
		super(Intent.METHOD.get(action)!);
	}
	public execute(actor: Proto.Creep): Result.ScreepsResult {
		const target = this.getTarget(actor);
		const result = target != undefined ? this.action.call(actor, target) : Consts.ERR_INVALID_TARGET;
		this.emote(actor, result);
		if (actor.id == 38) this.visualize(actor);
		return result;
	}
	public isComplete(actor: Proto.Creep): boolean {
		const target = this.getTarget(actor);
		if (target == undefined) return true;
		const intentRange = Intent.RANGE[this.intent];
		return (intentRange != undefined && actor.getRangeTo(target) > intentRange) || !!this.complete?.(actor, target);
	}
	private getTarget(actor: Proto.Creep): target_t | undefined {
		const targets = this.targeter(actor);
		const intentRange = Intent.RANGE[this.intent];
		// Filter targets by intent range
		const targetsInRange = intentRange ? targets.filter(target => actor.getRangeTo(target) <= intentRange) : targets;
		return this.selector ? this.selector(actor, targetsInRange) : targetsInRange.at(0);
	}
	public visualize(actor: Proto.Creep, visual = new Draw.Visual()) {
		const targets = this.targeter(actor);
		const target = this.selector ? this.selector(actor, targets) : targets.at(0);
		targets.forEach(current =>
			visual.line(actor, current, { lineStyle: "dashed", color: current == target ? "#00ff00" : "#808080" })
		);
		const range = Intent.RANGE[this.intent];
		if (range)
			visual.rect({ x: actor.x - range, y: actor.y - range }, range * 2, range * 2, {
				lineStyle: "dotted",
				opacity: 0.1,
				fill: undefined,
				stroke: "#ffffff",
				strokeWidth: 0.1
			});
	}
}
