export class Summary {
	public mean: number;
	public median: number;
	public range: number;
	public variance: number;
	public standardDeviation: number;
	public count: number;
	public constructor(population: Iterable<number>) {
		const pop = Array.from(population).sort((a, b) => a - b);
		this.count = pop.length;
		this.range = pop[pop.length - 1] - pop[0];
		this.mean = pop.reduce((sum, value) => sum + value) / pop.length;
		this.variance = pop.reduce((sum, value) => sum + (value - this.mean) ** 2, 0) / pop.length;
		this.standardDeviation = Math.sqrt(this.variance);
		this.median = pop[Math.floor(pop.length / 2)];
	}
}
