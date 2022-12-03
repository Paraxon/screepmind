import { Verbosity } from "./Verbosity";

export class Logger {
	private static channels = new Map<string, boolean>();
	public static verbosity = Verbosity.Trace;
	public static default = true;
	public static log(channel: string, message: string, verbosity = Verbosity.Info) {
		if (verbosity > this.verbosity)
			return;
		channel = channel.toLowerCase();
		if (!this.channels.has(channel))
			this.channels.set(channel, this.default);
		if (this.channels.get(channel))
			console.log(`[${channel}:${verbosity}] ${message}`);
	}
	public static toggle(channel: string, value: boolean) {
		this.channels.set(channel, value);
	}
}