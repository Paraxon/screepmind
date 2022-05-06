import Flatten from "@flatten-js/core";
import { GiftWrap } from "common/geometry/hull";
import { ArraySpan, MapSpan } from "./span";
import { Visual } from "game/visual";
import { StateSpan } from "./stateSpan";
import { ARENA_SHAPE } from "common/library";

export class Region {
	public root: Flatten.Point;
	public span: StateSpan;
	public hull?: Flatten.Point[];
	public constructor(root: Flatten.Point) {
		this.root = root;
		this.span = new StateSpan(Flatten.vector(ARENA_SHAPE.width, ARENA_SHAPE.height), root);
	}
	public get centroid(): Flatten.Point {
		if (this.span.size === 0) return this.root;
		const centroid = Array.from(this.span.vertices).reduce((sum, child) => sum.translate(child.x, child.y));
		centroid.x = Math.floor(centroid.x / this.span.size);
		centroid.y = Math.floor(centroid.y / this.span.size);
		return centroid;
	}
	public get rect() {
		const min = Flatten.point(Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY);
		const max = Flatten.point(Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY);
		for (const child of this.span.vertices) {
			min.x = Math.min(min.x, child.x);
			min.y = Math.min(min.y, child.y);
			max.x = Math.max(max.x, child.x);
			max.y = Math.max(max.y, child.y);
		}
		return new Flatten.Box(min.x, min.y, max.x - min.x, max.y - min.y);
	}
	public draw(visual: Visual, style: CircleStyle = {}) {
		visual.circle(this.centroid, { fill: "#0000ff" });
		visual.circle(this.root, style);
		this.hull ??= GiftWrap(Array.from(this.span.vertices));
		visual.poly(this.hull, style);
	}
}
