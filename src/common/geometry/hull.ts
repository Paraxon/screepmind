import Flatten from "@flatten-js/core";

export function GiftWrap(points: Flatten.Point[]) {
	if (points.length <= 2) return [];
	const hull = [points.reduce((left, point) => (point.x < left.x ? point : left))];
	for (const vertex of hull) {
		const next = points
			.filter(point => !point.equalTo(vertex))
			.reduce((left, point) => {
				return point.leftTo(Flatten.line(vertex, left)) ? point : left;
			});
		hull.push(next);
		if (next.equalTo(hull[0])) break;
	}
	return hull;
}
