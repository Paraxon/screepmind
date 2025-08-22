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
		const targets = this.targeter(actor);
		const target = this.selectTarget(actor, targets);
		const result = target != undefined ? this.action.call(actor, target) : Consts.ERR_INVALID_TARGET;
		this.emote(actor, result);
		if (actor.id == 32) this.visualize(actor);
		return result;
	}
	public isComplete(actor: Proto.Creep): boolean {
		const targets = this.targeter(actor);
		const target = this.selectTarget(actor, targets);
		return (target && this.complete?.(actor, target)) ?? false;
	}
	private selectTarget(actor: Proto.Creep, targets: target_t[]): target_t | undefined {
		const range = Intent.RANGE[this.intent];
		const inRange = range ? targets.filter(target => actor.getRangeTo(target) <= range) : targets;
		return this.selector && inRange.length ? this.selector(actor, inRange) : inRange.at(0);
	}
	public visualize(actor: Proto.Creep, visual = new Draw.Visual()) {
		const targets = this.targeter(actor);
		const selected = this.selectTarget(actor, targets);
		const start = Flatten.point(actor.x, actor.y);
		targets
			.filter(target => target != selected)
			.map(target => Flatten.segment(start, Flatten.point(target.x, target.y)))
			.map(segment => (segment.length > 3 ? segment.pointAtLength(3)! : segment.end))
			.forEach(mid =>
				visual.line(actor, mid, {
					lineStyle: "dashed",
					color: Intent.COLOR[this.intent] ?? "#8e8e8e"
				})
			);
		if (selected) {
			visual.line(actor, selected, {
				lineStyle: "dashed",
				color: "#ffffffff"
			});
		}
		const range = Intent.RANGE[this.intent];
		if (range) {
			const topLeft = { x: actor.x - range - 0.5, y: actor.y - range - 0.5 };
			const size = range * 2 + 1;
			visual.rect(topLeft, size, size, {
				lineStyle: "dotted",
				opacity: 0.1,
				fill: undefined,
				stroke: Intent.COLOR[this.intent] ?? "#8e8e8e",
				strokeWidth: 0.1
			});
		}
	}
}
