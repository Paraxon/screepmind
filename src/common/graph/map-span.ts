import { Equatable, Span } from "./span";
import { VertexRecord } from "./vertexrecord";

export class MapSpan<vertex_t extends Equatable> implements Span<vertex_t> {
	private _open = new Array<VertexRecord<vertex_t>>();
	private _closed = new Map<string, VertexRecord<vertex_t>>();
	public constructor(vertex: vertex_t) {
		this._open.push(new VertexRecord(vertex));
	}
	public removeOpen(record: VertexRecord<vertex_t>): void {
		const index = this._open.indexOf(record);
		if (index > -1) this._open.splice(index, 1);
	}
	public get finished() {
		return this._open.length === 0;
	}
	public peek(): VertexRecord<vertex_t> | null {
		return this._open.length > 0 ? this._open[0] : null;
	}
	public pop(): VertexRecord<vertex_t> | undefined {
		return this._open.shift();
	}
	public insertOpen(record: VertexRecord<vertex_t>): void {
		const index = this._open.findIndex(open => open.cost > record.cost);
		this._open.splice(index, 0, record);
	}
	public insertClosed(record: VertexRecord<vertex_t>): void {
		this._closed.set(JSON.stringify(record.vertex), record);
	}
	public removeClosed(record: VertexRecord<vertex_t>): void {
		this._closed.delete(JSON.stringify(record.vertex));
	}
	public get open(): Iterable<VertexRecord<vertex_t>> {
		return this._open;
	}
	public get closed(): Iterable<VertexRecord<vertex_t>> {
		return this._closed.values();
	}
	public get size(): number {
		return this.interior;
	}
	public get vertices(): Iterable<vertex_t> {
		return Array.from(this.closed).map(record => record.vertex);
	}
	public findClosed(vertex: vertex_t): VertexRecord<vertex_t> | undefined {
		return this._closed.get(JSON.stringify(vertex));
	}
	public findOpen(vertex: vertex_t): VertexRecord<vertex_t> | undefined {
		return this._open.find(record => record.vertex.equalTo(vertex));
	}
	public get exterior(): number {
		return this._open.length;
	}
	public get interior(): number {
		return this._closed.size;
	}
}
