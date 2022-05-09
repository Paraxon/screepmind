import Flatten from "@flatten-js/core";
import { Visual } from "game/visual";
import { Edge } from "./digraph";
import { RoomPosition } from "game/prototypes";
import { VertexRecord } from "./vertexrecord";

export interface Equatable {
	equalTo(other: Equatable): boolean;
}

export interface Span<vertex_t> {
	get closed(): Iterable<VertexRecord<vertex_t>>;
	get exterior(): number;
	get finished(): boolean;
	get interior(): number;
	get open(): Iterable<VertexRecord<vertex_t>>;
	get size(): number;
	get vertices(): Iterable<vertex_t>;
	findClosed(vertex: vertex_t): VertexRecord<vertex_t> | undefined;
	findOpen(vertex: vertex_t): VertexRecord<vertex_t> | undefined;
	insertClosed(record: VertexRecord<vertex_t>): void;
	insertOpen(record: VertexRecord<vertex_t>): void;
	peek(): VertexRecord<vertex_t> | undefined;
	pop(): VertexRecord<vertex_t> | undefined;
	removeClosed(record: VertexRecord<vertex_t>): void;
	removeOpen(record: VertexRecord<vertex_t>): void;
}

export class ArraySpan<vertex_t extends Equatable> implements Span<vertex_t> {
	private _open = new Array<VertexRecord<vertex_t>>();
	private _closed = new Array<VertexRecord<vertex_t>>();

	public constructor(vertex: vertex_t) {
		this._open.push(new VertexRecord(vertex));
	}
	public removeOpen(record: VertexRecord<vertex_t>): void {
		const index = this._open.indexOf(record);
		if (index > -1) this._open.splice(index, 1);
	}
	public peek() {
		return this._open[0];
	}
	public pop(): VertexRecord<vertex_t> | undefined {
		return this._open.shift();
	}
	public insertOpen(record: VertexRecord<vertex_t>) {
		const index = this._open.findIndex(open => open.cost > record.cost);
		this._open.splice(index, 0, record);
	}
	public insertClosed(record: VertexRecord<vertex_t>) {
		this._closed.push(record);
	}
	public removeClosed(record: VertexRecord<vertex_t>) {
		const index = this._closed.indexOf(record);
		if (index > -1) this._closed.splice(index, 1);
	}
	public get finished() {
		return this.exterior === 0;
	}
	public get vertices() {
		return this._closed.map(record => record.vertex);
	}
	public get open(): Iterable<VertexRecord<vertex_t>> {
		return this._open;
	}
	public get closed(): Iterable<VertexRecord<vertex_t>> {
		return this._closed;
	}
	public get size(): number {
		return this._closed.length;
	}
	public findClosed(vertex: vertex_t): VertexRecord<vertex_t> | undefined {
		return this._closed.find(record => record.vertex.equalTo(vertex));
	}
	public findOpen(vertex: vertex_t): VertexRecord<vertex_t> | undefined {
		return this._open.find(record => record.vertex.equalTo(vertex));
	}
	public get exterior(): number {
		return this._open.length;
	}
	public get interior(): number {
		return this._closed.length;
	}
}

export function draw<vertex_type extends Flatten.Point>(
	visual: Visual,
	span: Span<vertex_type>,
	edgeStyle: LineStyle = {},
	vertexStyle: CircleStyle = {}
): void {
	edgeStyle.lineStyle = undefined;
	for (const record of span.closed)
		if (record.edge) visual.line(record.edge.from, record.edge.to, edgeStyle);
		else visual.circle(record.vertex, vertexStyle);

	edgeStyle.lineStyle = "dashed";
	for (const record of span.open)
		if (record.edge) visual.line(record.edge.from, record.edge.to, edgeStyle);
		else visual.circle(record.vertex, vertexStyle);
}
