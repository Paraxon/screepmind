import * as Utils from "game/utils";
import * as Metric from "./math/Metric";

export class Match {
	private remainingTimeNs() {
		return /* arenaInfo.cpuTimeLimit */ 50000 - Utils.getCpuTime();
	}
	public remainingTime(units: Metric.Units = Metric.NONE) {
		return Metric.convert(this.remainingTimeNs(), Metric.NANO, units);
	}
}