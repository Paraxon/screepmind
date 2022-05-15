import Flatten from "@flatten-js/core";
import { ARENA_SHAPE } from "common/Library";
import concaveman from "concaveman";
import { RoomPosition } from "game/prototypes";
import { Visual } from "game/visual";
import { StateSpan } from "./Span/StateSpan";

export class Region implements RoomPosition {
	public get x(): number { return this.root.x; }
	public get y(): number { return this.root.y; }
	public root: Flatten.Point;
	public span: StateSpan;
	private _hull?: Flatten.Polygon;
	public get hull(): Flatten.Polygon {
		return this._hull ??= new Flatten.Polygon(
			concaveman(Array.from(this.span.vertices).map(vertex => [vertex.x, vertex.y]))
				.map(v => Flatten.point(v[0], v[1])));
	}
	private _centroid?: Flatten.Point;
	public constructor(root: Flatten.Point) {
		this.root = root;
		this.span = new StateSpan(Flatten.vector(ARENA_SHAPE.width, ARENA_SHAPE.height), root);
	}
	public get centroid(): Flatten.Point {
		return this._centroid ??= this.calcCentroid();
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
	public draw(visual: Visual, rootStyle: CircleStyle = {}, centroidStyle: CircleStyle = { fill: "#ff0000" }, borderStyle: LineStyle = {}) {
		visual.circle(this.root, rootStyle);
		visual.circle(this.centroid, centroidStyle);
		visual.poly(this.hull.vertices, borderStyle);
		visual.line(this.hull.vertices[0], this.hull.vertices[this.hull.vertices.length - 1], borderStyle);
	}
	private calcCentroid(): Flatten.Point {
		if (this.span.interior == 0) return this.root;
		const centroid = Array.from(this.span.vertices).reduce((sum, child) => sum.translate(child.x, child.y));
		centroid.x = Math.floor(centroid.x / this.span.size);
		centroid.y = Math.floor(centroid.y / this.span.size);
		return centroid;
	}
}
