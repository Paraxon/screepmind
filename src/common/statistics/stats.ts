export class Summary {
    mean: number;
    median: number;
    // mode: number;
    range: number;
    variance: number;
    standardDeviation: number;
    count: number;
    constructor(population: Iterable<number>) {
        const pop = Array.from(population).sort((a, b) => a - b);
        this.count = pop.length;
        this.range = pop[pop.length - 1] - pop[0];
        this.mean = pop.reduce((sum, value) => sum + value) / pop.length;
        this.variance = pop.reduce((sum, value) => sum + (value - this.mean) ** 2, 0) / pop.length;
        this.standardDeviation = Math.sqrt(this.variance);
        this.median = pop[Math.floor(pop.length / 2)];
    }
}
