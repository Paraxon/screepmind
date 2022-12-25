
export class Classification<class_t> {
	membership = new Map<class_t, number>();
	public get best(): class_t | undefined {
		return this.membership.size ? Array
			.from(this.membership.entries())
			.reduce(([best, bestScore], [current, currentScore]) =>
				bestScore > currentScore ? [best, bestScore] : [current, currentScore])[0]
			: undefined;
	}
	public set(classification: class_t, membership: number) {
		this.membership.set(classification, membership);
	}
	public test(classification: class_t): number {
		return this.membership.get(classification) ?? 0;
	}
}
