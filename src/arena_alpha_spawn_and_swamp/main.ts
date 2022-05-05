import Flatten from "@flatten-js/core";
import { Cluster } from "common/graph/cluster";
import { KMeans } from "common/graph/clustering";
import { draw } from "common/graph/span";
import { TileGraph } from "common/graph/tilegraph";
import { getTicks } from "game";
import { Visual } from "game/visual";

let kmeans: KMeans;
let regions: Array<Cluster>;

export function loop() {
	const visual = new Visual(1, false);
	const tiles = new TileGraph();

	kmeans ??= new KMeans(tiles, 25, 3);
	regions = kmeans.execute(50);
	for (const region of regions) {
		region.draw(visual);
	}
}
