import { KMeans } from "common/graph/kmeans";
import { Region } from "common/graph/region";
import { draw } from "common/graph/span";
import { TileGraph } from "common/graph/tilegraph";
import { remainingTimeMs } from "common/library";
import { convert, MILLI, NANO } from "common/metric";
import { getCpuTime, getTicks } from "game";
import { Visual } from "game/visual";

let kmeans: KMeans;
let regions: Array<Region>;

export function loop() {
	const visual = new Visual(1, false);
	const tiles = new TileGraph();
	console.log(remainingTimeMs());

	kmeans ??= new KMeans(tiles, 50, 3);
	if (getTicks() == 1) {
		const start = getCpuTime();
		regions = kmeans.execute();
		const end = getCpuTime();
		console.log(`KMeans in ${convert(end - start, NANO, MILLI)}ms`);
	}
	// /* else
	draw(visual, regions[getTicks() % regions.length].span);
	const start = getCpuTime();
	for (const region of regions) {
		// console.log(region.span.exterior, region.span.interior);
		region.draw(visual);
	}
	const end = getCpuTime();
	console.log(`Concave Hull in ${convert(end - start, NANO, MILLI)}ms`);
}
