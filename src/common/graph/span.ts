"use strict";

import Flatten from "@flatten-js/core";
import { Visual } from "game/visual";
import { Edge } from "./digraph";
import { RoomPosition } from "game/prototypes";

export class VertexRecord<vertex_t> {
	vertex: vertex_t;
	edge?: Edge<vertex_t>;
	cost: number = 0;
	constructor(vertex: vertex_t, edge?: Edge<vertex_t>, cost?: number) {
		this.vertex = vertex;
		this.edge = edge;
		this.cost = cost || 0;
	}
}

export interface Span<vertex_t> {
	get finished(): boolean;
	peek(): VertexRecord<vertex_t> | null;
	pop(): VertexRecord<vertex_t> | undefined;
	push(record: VertexRecord<vertex_t>): void;
	close(record: VertexRecord<vertex_t>): void;
	reopen(record: VertexRecord<vertex_t>): void;
	remove(record: VertexRecord<vertex_t>): void;
	get open(): Iterable<VertexRecord<vertex_t>>;
	get closed(): Iterable<VertexRecord<vertex_t>>;
	get size(): number;
	get vertices(): Iterable<vertex_t>;
	findClosed(predicate: (record: VertexRecord<vertex_t>) => boolean): VertexRecord<vertex_t> | undefined;
	findOpen(predicate: (record: VertexRecord<vertex_t>) => boolean): VertexRecord<vertex_t> | undefined;
	get exterior(): number;
	get interior(): number;
}

export class SpanningTree<vertex_t> implements Span<vertex_t> {
	private _open: Array<VertexRecord<vertex_t>> = new Array();
	private _closed: Array<VertexRecord<vertex_t>> = new Array();

	constructor(vertex: vertex_t) {
		this._open.push(new VertexRecord(vertex));
	}
	peek() {
		return this._open.length > 0 ? this._open[0] : null;
	}
	pop(): VertexRecord<vertex_t> | undefined {
		return this._open.shift();
	}
	push(record: VertexRecord<vertex_t>) {
		const index = this._open.findIndex(open => open.cost > record.cost);
		this._open.splice(index, 0, record);
	}
	close(record: VertexRecord<vertex_t>) {
		this._closed.push(record);
	}
	reopen(record: VertexRecord<vertex_t>) {
		const index = this._closed.indexOf(record);
		if (index > -1)
			this._closed.splice(index, 1);
	}
	get finished() {
		return this.exterior === 0;
	}
	get vertices() {
		return this._closed.map(record => record.vertex);
	}
	get open(): Iterable<VertexRecord<vertex_t>> {
		return this._open;
	}
	get closed(): Iterable<VertexRecord<vertex_t>> {
		return this._closed;
	}
	get size(): number {
		return this._closed.length;
	}
	findClosed(predicate: ((record: VertexRecord<vertex_t>) => boolean)): VertexRecord<vertex_t> | undefined {
		return this._closed.find(predicate);
	}
	findOpen(predicate: ((record: VertexRecord<vertex_t>) => boolean)): VertexRecord<vertex_t> | undefined {
		return this._open.find(predicate);
	}
	remove(record: VertexRecord<vertex_t>): void {
		const index = this._closed.indexOf(record);
		if (index > -1)
			this._closed.splice(index, 1);
	}
	get exterior(): number {
		return this._open.length;
	}
	get interior(): number {
		return this._closed.length;
	}
}

export function draw<vertex_type extends Flatten.Point>(visual: Visual, span: Span<vertex_type>, edgeStyle: LineStyle = {}, vertexStyle: CircleStyle = {}) {
	edgeStyle.lineStyle = undefined;
	for (const record of span.closed)
		if (record.edge) visual.line(record.edge.from, record.edge.to, edgeStyle);
		else visual.circle(record.vertex, vertexStyle);

	edgeStyle.lineStyle = "dashed";
	for (const record of span.open)
		if (record.edge) visual.line(record.edge.from, record.edge.to, edgeStyle);
		else visual.circle(record.vertex, vertexStyle);
}
