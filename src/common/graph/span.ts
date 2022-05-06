"use strict";

import Flatten from "@flatten-js/core";
import { Visual } from "game/visual";
import { Edge } from "./digraph";
import { RoomPosition } from "game/prototypes";

interface Equatable {
	equalTo(other: Equatable): boolean;
}

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
	peek(): VertexRecord<vertex_t> | null;
	pop(): VertexRecord<vertex_t> | undefined;
	removeClosed(record: VertexRecord<vertex_t>): void;
	removeOpen(record: VertexRecord<vertex_t>): void;
}

export class ArraySpan<vertex_t extends Equatable> implements Span<vertex_t> {
	private _open: Array<VertexRecord<vertex_t>> = new Array();
	private _closed: Array<VertexRecord<vertex_t>> = new Array();

	constructor(vertex: vertex_t) {
		this._open.push(new VertexRecord(vertex));
	}
	removeOpen(record: VertexRecord<vertex_t>): void {
		const index = this._open.indexOf(record);
		if (index > -1)
			this._open.splice(index, 1);
	}
	peek() {
		return this._open.length > 0 ? this._open[0] : null;
	}
	pop(): VertexRecord<vertex_t> | undefined {
		return this._open.shift();
	}
	insertOpen(record: VertexRecord<vertex_t>) {
		const index = this._open.findIndex(open => open.cost > record.cost);
		this._open.splice(index, 0, record);
	}
	insertClosed(record: VertexRecord<vertex_t>) {
		this._closed.push(record);
	}
	removeClosed(record: VertexRecord<vertex_t>) {
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
	findClosed(vertex: vertex_t): VertexRecord<vertex_t> | undefined {
		return this._closed.find(record => record.vertex.equalTo(vertex));
	}
	findOpen(vertex: vertex_t): VertexRecord<vertex_t> | undefined {
		return this._open.find(record => record.vertex.equalTo(vertex));
	}
	get exterior(): number {
		return this._open.length;
	}
	get interior(): number {
		return this._closed.length;
	}
}

export class MapSpan<vertex_t extends Equatable> implements Span<vertex_t> {
	private _open = new Array<VertexRecord<vertex_t>>();
	private _closed = new Map<string, VertexRecord<vertex_t>>();
	constructor(vertex: vertex_t) {
		this._open.push(new VertexRecord(vertex));
	}
	removeOpen(record: VertexRecord<vertex_t>): void {
		const index = this._open.indexOf(record);
		if (index > -1)
			this._open.splice(index, 1);
	}
	get finished(): boolean {
		return this._open.length === 0;
	}
	peek(): VertexRecord<vertex_t> | null {
		return this._open.length > 0 ? this._open[0] : null;
	}
	pop(): VertexRecord<vertex_t> | undefined {
		return this._open.shift();
	}
	insertOpen(record: VertexRecord<vertex_t>): void {
		const index = this._open.findIndex(open => open.cost > record.cost);
		this._open.splice(index, 0, record);
	}
	insertClosed(record: VertexRecord<vertex_t>): void {
		this._closed.set(JSON.stringify(record.vertex), record);
	}
	removeClosed(record: VertexRecord<vertex_t>): void {
		this._closed.delete(JSON.stringify(record.vertex));
	}
	get open(): Iterable<VertexRecord<vertex_t>> {
		return this._open;
	}
	get closed(): Iterable<VertexRecord<vertex_t>> {
		return this._closed.values();
	}
	get size(): number {
		return this.interior;
	}
	get vertices(): Iterable<vertex_t> {
		return Array.from(this.closed).map(record => record.vertex);
	}
	findClosed(vertex: vertex_t): VertexRecord<vertex_t> | undefined {
		return this._closed.get(JSON.stringify(vertex));
	}
	findOpen(vertex: vertex_t): VertexRecord<vertex_t> | undefined {
		return this._open.find(record => record.vertex.equalTo(vertex));
	}
	get exterior(): number {
		return this._open.length;
	}
	get interior(): number {
		return this._closed.size;
	}
}

export function draw<vertex_type extends Flatten.Point>(visual: Visual, span: Span<vertex_type>, edgeStyle: LineStyle = {}, vertexStyle: CircleStyle = {}): void {
	edgeStyle.lineStyle = undefined;
	for (const record of span.closed)
		if (record.edge) visual.line(record.edge.from, record.edge.to, edgeStyle);
		else visual.circle(record.vertex, vertexStyle);

	edgeStyle.lineStyle = "dashed";
	for (const record of span.open)
		if (record.edge) visual.line(record.edge.from, record.edge.to, edgeStyle);
		else visual.circle(record.vertex, vertexStyle);
}
