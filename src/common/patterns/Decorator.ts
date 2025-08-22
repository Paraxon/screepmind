export class Decorator<target_t extends object, handler_t extends object> implements ProxyHandler<handler_t> {
	get(handler: handler_t, key: PropertyKey, target: target_t) {
		// Prefer handlers own properties/methods
		if (key in handler) return Reflect.get(handler, key, target);
		// Delegate to the underlying target
		return Reflect.get(target, key);
	}
	set(handler: handler_t, prop: PropertyKey, value: any, target: target_t) {
		if (prop in handler) return Reflect.set(handler, prop, value, target);
		return Reflect.set(target, prop, value);
	}
}
