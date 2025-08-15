export type Prototype<object_t> = new () => object_t;
export type Predicate<arg_t> = (arg: arg_t) => boolean;
export type VariadicPredicate<args_t extends any[]> = (...args: args_t) => boolean;
export type Reducer<value_t> = (a: value_t, b: value_t) => value_t;
export type Compare<value_t> = (a: value_t, b: value_t) => boolean;
export const strict_equal: Compare<number> = (a: number, b: number) => a === b;
export const greater: Compare<number> = (a: number, b: number) => a > b;
export const greater_equal: Compare<number> = (a: number, b: number) => a >= b;
export const less: Compare<number> = (a: number, b: number) => a < b;
export const less_equal: Compare<number> = (a: number, b: number) => a <= b;

export function not<actor_t>(predicate: Predicate<actor_t>): Predicate<actor_t> {
	return (actor: actor_t) => !predicate(actor);
}

export function and<actor_t>(...conditions: Predicate<actor_t>[]): Predicate<actor_t> {
	return (actor: actor_t) => conditions.every(condition => condition(actor));
}

export function or<actor_t>(...conditions: Predicate<actor_t>[]): Predicate<actor_t> {
	return (actor: actor_t) => conditions.some(condition => condition(actor));
}
