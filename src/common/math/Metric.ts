export const YOTTA = 1e24;
export const ZETTA = 1e21;
export const EXA = 1e18;
export const PETA = 1e15;
export const TERA = 1e12;
export const GIGA = 1e9;
export const MEGA = 1e6;
export const KILO = 1e3;
export const HECTO = 1e2;
export const DECA = 1e1;

export const NONE = 1;

export const DECI = 10e-1;
export const CENTI = 10e-2;
export const MILLI = 10e-3;
export const MICRO = 10e-6;
export const NANO = 10e-9;
export const PICO = 10e-12;
export const FEMTO = 10e-15;
export const ATTO = 10e-18;
export const ZEPTO = 10e-21;
export const YOCTO = 10e-24;

export type Units
	= typeof YOTTA
	| typeof ZETTA
	| typeof EXA
	| typeof PETA
	| typeof TERA
	| typeof GIGA
	| typeof MEGA
	| typeof KILO
	| typeof HECTO
	| typeof DECA
	| typeof NONE
	| typeof DECI
	| typeof CENTI
	| typeof MILLI
	| typeof MICRO
	| typeof NANO
	| typeof PICO
	| typeof FEMTO
	| typeof ATTO
	| typeof ZEPTO
	| typeof YOCTO;

export function convert(value: number, from: Units, to: Units) {
	return value * (from / to);
}
