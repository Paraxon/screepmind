import Flatten from "@flatten-js/core";
import { Span, VertexRecord } from "./span";

enum RecordState {
    Open,
    Closed,
    Unvisited
}

export class StateRecord<vertex_t> extends VertexRecord<vertex_t> {
    state: RecordState = RecordState.Unvisited;
}

export class StateSpan implements Span<Flatten.Point> {
    _openQueue = new Array<number>();
    _records: Array<StateRecord<Flatten.Point>>;
    _dimensions: Flatten.Vector;

    constructor(dimensions: Flatten.Vector, vertex: Flatten.Point) {
        this._dimensions = dimensions;
        this._records = new Array(dimensions.x * dimensions.y);
        for (let i = 0; i < this._records.length; i++)
            this._records[i] = new StateRecord(this.toPoint(i));
    }
    private toIndex(point: Flatten.Point): number {
        return point.x + point.y * this._dimensions.x;
    }
    private toPoint(index: number): Flatten.Point {
        return new Flatten.Point(index % this._dimensions.x, Math.floor(index / this._dimensions.x));
    }
    get closed(): Iterable<VertexRecord<Flatten.Point>> {
        return this._records.filter(record => record.state === RecordState.Closed);
    }
    get exterior(): number {
        return this._openQueue.length;
    }
    get finished(): boolean {
        return this.exterior === 0;
    }
    get interior(): number {
        return this._records.reduce((count, record) => record.state === RecordState.Closed ? count + 1 : count, 0);
    }
    get open(): Iterable<VertexRecord<Flatten.Point>> {
        return this._openQueue.map(index => this._records[index]);
    }
    get size(): number {
        return this.interior;
    }
    get vertices(): Iterable<Flatten.Point> {
        return this._records.filter(record => record.state === RecordState.Closed).map(record => record.vertex);
    }
    insertClosed(record: VertexRecord<Flatten.Point>): void {
        const closed = this._records[this.toIndex(record.vertex)];
        closed.state = RecordState.Closed;
        Object.assign(closed, record);
    }
    findClosed(vertex: Flatten.Point): VertexRecord<Flatten.Point> | undefined {
        const record = this._records[this.toIndex(vertex)];
        return record.state === RecordState.Closed ? record : undefined;
    }
    findOpen(vertex: Flatten.Point): VertexRecord<Flatten.Point> | undefined {
        const record = this._records[this.toIndex(vertex)];
        return record.state === RecordState.Open ? record : undefined;
    }
    peek(): VertexRecord<Flatten.Point> | null {
        return this._openQueue.length > 0 ? this._records[this._openQueue[0]] : null;
    }
    pop(): VertexRecord<Flatten.Point> | undefined {
        const index = this._openQueue.shift();
        return index !== undefined ? this._records[index] : undefined;
    }
    insertOpen(record: VertexRecord<Flatten.Point>): void {
        const index = this.toIndex(record.vertex);

        // Insert into the priority queue
        const position = this._openQueue.findIndex(open => this._records[open].cost > record.cost);
        this._openQueue.splice(position, 0, index);

        const open = this._records[index];
        open.state = RecordState.Open;
        Object.assign(open, record);
    }
    removeClosed(record: VertexRecord<Flatten.Point>): void {
        this._records[this.toIndex(record.vertex)].state = RecordState.Unvisited;
    }
    removeOpen(record: VertexRecord<Flatten.Point>): void {
        const index = this.toIndex(record.vertex);
        this._records[index].state = RecordState.Unvisited;

        // Remove from the priority queue
        const position = this._openQueue.indexOf(index);
        this._openQueue.splice(position, 1);
    }
}
