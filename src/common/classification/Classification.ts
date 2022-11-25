
export class Classification<class_t> {
	private membership = new Map<class_t, number>();
	public get best(): class_t | undefined {
		return Array.from(this.membership.entries()).reduce((a, b) => a[1] > b[1] ? a : b)[0];
	}
	public set(classification: class_t, membership: number) {
		this.membership.set(classification, membership);
	}
	public test(classification: class_t): number {
		return this.membership.get(classification) ?? 0;
	}
}
