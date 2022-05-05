"use strict";

import Flatten from '@flatten-js/core';

export function GiftWrap(points: Array<Flatten.Point>) {
	if (points.length <= 2) return [];
	const hull = [points.reduce((left, point) => (point.x < left.x ? point : left))];
	for (let i = 0; i < hull.length; i++) {
		const next = points.filter(point => !point.equalTo(hull[i])).reduce((left, point) => {
			return point.leftTo(Flatten.line(hull[i], left)) ? point : left;
		});
		hull.push(next);
		if (next.equalTo(hull[0])) break;
	}
	return hull;
}
