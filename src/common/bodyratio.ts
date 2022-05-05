"use strict";

import * as Consts from 'game/constants';
import * as Lib from './library.js';

export class BodyRatio {
    parts = new Map<Consts.BodyPartConstant, number>();

    with(type: Consts.BodyPartConstant, qty: number) {
        this.parts.set(type, qty);
        return this;
    }
    add(type: Consts.BodyPartConstant, qty: number) {
        this.parts.set(type, (this.parts.get(type) ?? 0) + qty);
    }
    get cost() {
        let cost = 0;
        for (const [type, qty] of this.parts)
            cost += Consts.BODYPART_COST[type] * qty;
        return cost;
    }
    get spawn() {
        return this.priorities.flatMap(type => new Array(this.parts.get(type)).fill(type));
    }
    get priorities(): Array<Consts.BodyPartConstant> {
        return Array.from(this.parts.keys()).sort((a, b) => Consts.BODYPART_COST[a] - Consts.BODYPART_COST[b]);
    }
    get size() {
        return Array.from(this.parts.values()).reduce((sum, qty) => sum + qty);
    }
    get burden() {
        return this.size - (this.parts.get(Consts.MOVE) ?? 0);
    }
    with_speed(movement_period = 1, fatigue_factor = Lib.FATIGUE_FACTOR[Lib.TERRAIN_PLAIN]) {
        let ratio = new BodyRatio();
        for (const [type, qty] of this.parts)
            ratio.with(type, qty);
        const moves = Math.ceil((this.size * fatigue_factor) / movement_period);
        return ratio.with(Consts.MOVE, moves);
    }
    scaled_to(budget: number, fractional = false) {
        let ratio = new BodyRatio();
        const cost = this.cost;
        const scale = Math.floor(budget / cost);
        for (const [type, qty] of this.parts)
            ratio.with(type, qty * scale)

        if (fractional) {
            let change = budget % cost;
            for (const type of this.priorities)
                if (change > Consts.BODYPART_COST[type]) {
                    const max = Math.floor(change / Consts.BODYPART_COST[type]);
                    const qty = Math.min(this.parts.get(type) ?? max, max);
                    ratio.add(type, qty);
                    change -= Consts.BODYPART_COST[type] * qty;
                }
        }

        return ratio;
    }
};