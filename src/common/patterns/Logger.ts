import { GameObject } from "game/prototypes";
import { TextVisualStyle, Visual } from "game/visual";
import { Verbosity } from "./Verbosity";

export class Logger {
	private static channels = new Map<string, boolean>();
	public static verbosity = Verbosity.Trace;
	public static default = true;
	private static speech = new Map<GameObject, string>();
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
	public static say(actor: GameObject, message: string) {
		message = (this.speech.get(actor) ?? "") + message;
		this.speech.set(actor, message);
	}
	public static draw(visual: Visual = new Visual()): void {
		const style: TextVisualStyle = { font: 2 / 3, align: "center" };
		this.speech.forEach((message, actor) => visual.text(message, actor, style));
		this.speech.clear();
	}
}