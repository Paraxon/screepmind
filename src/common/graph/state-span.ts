/* eslint-disable max-classes-per-file */
import Flatten from "@flatten-js/core";
import { Span } from "./span";
import { VertexRecord } from "./vertexrecord";

enum RecordState {
	Open,
	Closed,
	Unvisited
}

export class StateRecord<vertex_t> extends VertexRecord<vertex_t> {
	public state: RecordState = RecordState.Unvisited;
}

export class StateSpan implements Span<Flatten.Point> {
	private _openQueue = new Array<number>();
	private _records: StateRecord<Flatten.Point>[];
	private _dimensions: Flatten.Vector;
	private _interior = 0;

	public constructor(dimensions: Flatten.Vector, vertex: Flatten.Point) {
		this._dimensions = dimensions;
		this._records = new Array<StateRecord<Flatten.Point>>(dimensions.x * dimensions.y);
		for (let i = 0; i < this._records.length; i++) this._records[i] = new StateRecord(this.toPoint(i));
		this.insertOpen(new StateRecord(vertex));
	}
	private toIndex(point: Flatten.Point): number {
		return point.x + point.y * this._dimensions.x;
	}
	private toPoint(index: number): Flatten.Point {
		return new Flatten.Point(index % this._dimensions.x, Math.floor(index / this._dimensions.x));
	}
	public get closed(): Iterable<VertexRecord<Flatten.Point>> {
		return this._records.filter(record => record.state === RecordState.Closed);
	}
	public get exterior(): number {
		return this._openQueue.length;
	}
	public get finished(): boolean {
		return this.exterior === 0;
	}
	public get interior(): number {
		return this._interior;
	}
	public get open(): Iterable<VertexRecord<Flatten.Point>> {
		return this._openQueue.map(index => this._records[index]);
	}
	public get size(): number {
		return this.interior;
	}
	public get vertices(): Iterable<Flatten.Point> {
		return this._records.filter(record => record.state === RecordState.Closed).map(record => record.vertex);
	}
	public insertClosed(record: VertexRecord<Flatten.Point>): void {
		const closed = this._records[this.toIndex(record.vertex)];
		closed.state = RecordState.Closed;
		Object.assign(closed, record);
		this._interior++;
	}
	public findClosed(vertex: Flatten.Point): VertexRecord<Flatten.Point> | undefined {
		const record = this._records[this.toIndex(vertex)];
		return record.state === RecordState.Closed ? record : undefined;
	}
	public findOpen(vertex: Flatten.Point): VertexRecord<Flatten.Point> | undefined {
		const record = this._records[this.toIndex(vertex)];
		return record.state === RecordState.Open ? record : undefined;
	}
	public peek(): VertexRecord<Flatten.Point> | undefined {
		return this._records[this._openQueue[0]];
	}
	public pop(): VertexRecord<Flatten.Point> | undefined {
		const index = this._openQueue.shift();
		return index !== undefined ? this._records[index] : undefined;
	}
	public insertOpen(record: VertexRecord<Flatten.Point>): void {
		const index = this.toIndex(record.vertex);

		// Insert into the priority queue
		const position = this._openQueue.findIndex(i => this._records[i].cost > record.cost);
		this._openQueue.splice(position, 0, index);

		const open = this._records[index];
		open.state = RecordState.Open;
		Object.assign(open, record);
	}
	public removeClosed(record: VertexRecord<Flatten.Point>): void {
		this._records[this.toIndex(record.vertex)].state = RecordState.Unvisited;
		this._interior--;
	}
	public removeOpen(record: VertexRecord<Flatten.Point>): void {
		const index = this.toIndex(record.vertex);
		this._records[index].state = RecordState.Unvisited;

		// Remove from the priority queue
		const position = this._openQueue.indexOf(index);
		this._openQueue.splice(position, 1);
	}
}
