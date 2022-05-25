import Flatten from "@flatten-js/core";
import { VertexRecord } from "./VertexRecord";
import { Visual } from "game/visual";

export interface Equatable<other_t> {
	equalTo(other: other_t): boolean;
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
