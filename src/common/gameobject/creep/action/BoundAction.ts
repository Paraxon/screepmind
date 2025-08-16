import * as Proto from "game/prototypes";
import * as Result from "../../Result";
import * as Intent from "../CreepIntent";
import * as Consts from "game/constants";
import { CreepAction } from "./CreepAction";
import * as Draw from "game/visual";
import Flatten from "@flatten-js/core";

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
		const target = this.selectTargetInRange(actor);
		const result = target != undefined ? this.action.call(actor, target) : Consts.ERR_INVALID_TARGET;
		this.emote(actor, result);
		if (actor.id == 31) this.visualize(actor);
		return result;
	}
	public isComplete(actor: Proto.Creep): boolean {
		const target = this.selectTargetInRange(actor);
		return (target && this.complete?.(actor, target)) ?? false;
	}
	private selectTargetInRange(actor: Proto.Creep): target_t | undefined {
		const targets = this.targeter(actor);
		const range = Intent.RANGE[this.intent];
		const inRange = range ? targets.filter(target => actor.getRangeTo(target) <= range) : targets;
		return this.selector && inRange.length ? this.selector(actor, inRange) : inRange.at(0);
	}
	public visualize(actor: Proto.Creep, visual = new Draw.Visual()) {
		const targets = this.targeter(actor);
		// const selected = this.selector ? this.selector(actor, targets) : targets.at(0);
		const start = Flatten.point(actor.x, actor.y);
		targets
			.map(target => Flatten.point(target.x, target.y))
			.map(end => Flatten.segment(start, end).middle())
			.forEach(mid =>
				visual.line(actor, mid, {
					lineStyle: "dashed",
					color: "#00ff00"
				})
			);
		const range = Intent.RANGE[this.intent];
		if (range) {
			const topLeft = { x: actor.x - range - 0.5, y: actor.y - range - 0.5 };
			const size = range * 2 + 1;
			visual.rect(topLeft, size, size, {
				lineStyle: "dotted",
				opacity: 0.1,
				fill: undefined,
				stroke: "#ffffff",
				strokeWidth: 0.1
			});
		}
	}
}
