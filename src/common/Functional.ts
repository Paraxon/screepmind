export type Predicate<arg_t> = (arg: arg_t) => boolean;
export type BinaryPredicate<lhs_t, rhs_t> = (lhs: lhs_t, rhs: rhs_t) => boolean;
export type Reducer<value_t> = (lhs: value_t, rhs: value_t) => value_t;
export type Compare<value_t> = (lhs: value_t, rhs: value_t) => number;
export const strict_equal: Compare<number> = (lhs: number, rhs: number) => (lhs === rhs ? 0 : -1);
export const greater: Compare<number> = (lhs: number, rhs: number) => (lhs > rhs ? 1 : -1);
export const greater_equal: Compare<number> = (lhs: number, rhs: number) => (lhs >= rhs ? 1 : -1);
export const less: Compare<number> = (lhs: number, rhs: number) => (lhs < rhs ? -1 : 1);
export const less_equal: Compare<number> = (lhs: number, rhs: number) => (lhs <= rhs ? -1 : 1);

export function not<actor_t>(predicate: Predicate<actor_t>): Predicate<actor_t> {
	return (actor: actor_t) => !predicate(actor);
}

export function and<actor_t>(...conditions: Predicate<actor_t>[]): Predicate<actor_t> {
	return (actor: actor_t) => conditions.every(condition => condition(actor));
}

export function or<actor_t>(...conditions: Predicate<actor_t>[]): Predicate<actor_t> {
	return (actor: actor_t) => conditions.some(condition => condition(actor));
}
