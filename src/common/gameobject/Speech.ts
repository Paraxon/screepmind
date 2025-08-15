import { GameObject } from "game/prototypes";
import { Visual, TextVisualStyle } from "game/visual";

export class Speech {
	private static messages = new Map<GameObject, string>();
	public static say(actor: GameObject, message: string) {
		if (message == undefined) console.log(`actor #${actor.id} attempted to say undefined`);
		message = (this.messages.get(actor) ?? "") + message;
		this.messages.set(actor, message);
	}
	public static draw(visual: Visual = new Visual()): void {
		const style: TextVisualStyle = { font: 2 / 3, align: "center" };
		this.messages.forEach((message, actor) => visual.text(message, actor, style));
		this.messages.clear();
	}
}
