"use strict";

export const YOTTA = 1e+24;
export const ZETTA = 1e+21;
export const EXA = 1e+18;
export const PETA = 1e+15;
export const TERA = 1e+12;
export const GIGA = 1e+9;
export const MEGA = 1e+6;
export const KILO = 1e+3;
export const HECTO = 1e+2;
export const DECA = 1e+1;

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

export function convert(value : number, from : number, to : number) {
	return value * from / to;
}