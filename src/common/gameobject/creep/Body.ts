import * as Lib from "common/library";
import * as Utils from "game/utils";
import * as Proto from "game/prototypes";
import * as Consts from "game/constants";

export abstract class Body {
	abstract get cost(): number;
	abstract get size(): number;
	abstract fatigueGeneration(terrain: Utils.Terrain): Lib.Fatigue;
	abstract countParts(...types: Proto.BodyPartType[]): number;
	public fatigueReduction(): Lib.Fatigue {
		return this.countParts(Consts.MOVE) * Lib.FATIGUE_REDUCTION_PER_MOVE;
	}
	public movePeriod(terrain: Utils.Terrain): Lib.Ticks | undefined {
		const reduction = this.fatigueReduction();
		return reduction > 0 ? Math.ceil(this.fatigueGeneration(terrain) / reduction) : undefined;
	}
	public ticksToTravel(path: Proto.Position[]): Lib.Ticks | undefined {
		const periods: Record<Utils.Terrain, Lib.Ticks | undefined> = {
			[Consts.TERRAIN_PLAIN]: this.movePeriod(Consts.TERRAIN_PLAIN),
			[Consts.TERRAIN_SWAMP]: this.movePeriod(Consts.TERRAIN_SWAMP),
			[Consts.TERRAIN_WALL]: undefined
		};
		const terrain = path.map(pos => Utils.getTerrainAt(pos));
		return terrain.includes(Consts.TERRAIN_WALL)
			? undefined
			: terrain.map(terrain => periods[terrain]!).reduce((sum, current) => sum + current, 0);
	}
	public spawnTime(): Lib.Ticks {
		return this.size * Consts.CREEP_SPAWN_TIME;
	}
}
