import { KMeans } from "common/graph/kmeans";
import { Region } from "common/graph/region";
import { TileGraph } from "common/graph/tilegraph";
import { convert, MILLI, NANO } from "common/metric";
import { getCpuTime, getTicks } from "game";
import { Visual } from "game/visual";

let kmeans: KMeans;
let regions: Array<Region>;

export function loop() {
	const visual = new Visual(1, false);
	const tiles = new TileGraph();

	kmeans ??= new KMeans(tiles, 25, 1);
	if (getTicks() == 1) {
		const start = getCpuTime();
		regions = kmeans.execute();
		const end = getCpuTime();
		console.log(`KMeans in ${convert(end - start, NANO, MILLI)}ms`);
	}
	/* else
		regions[getTicks() % regions.length].draw(visual); */
	for (const region of regions) {
		console.log(region.span.exterior, region.span.interior);
		region.draw(visual);
	}
}
