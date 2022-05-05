"use strict";

/* import { Creep } from "game/prototypes";

const SCREEP_ACTION = {
	ATTACK: Creep.attack,
	BUILD: Creep.build,
	DROP: Creep.drop,
	HARVEST: Creep.harvest,
	HEAL: Creep.heal,
	MOVE: Creep.move,
	MOVE_TO: Creep.moveTo,
	PICKUP: Creep.pickup,
	PULL: Creep.pull,
	RANGED_ATTACK: Creep.rangedAttack,
	RANGED_HEAL: Creep.rangedHeal,
	RANGED_MASS_ATTACK: Creep.rangedMassAttack,
	TRANSFER: Creep.transfer,
	WITHDRAW: Creep.withdraw,
};

const ACTION_PIPELINES = [
	[SCREEP_ACTION.HARVEST, SCREEP_ACTION.ATTACK, SCREEP_ACTION.BUILD, SCREEP_ACTION.RANGED_HEAL, SCREEP_ACTION.HEAL],
	[SCREEP_ACTION.RANGED_ATTACK, SCREEP_ACTION.RANGED_MASS_ATTACK, SCREEP_ACTION.BUILD, SCREEP_ACTION.RANGED_HEAL],
	[SCREEP_ACTION.BUILD, SCREEP_ACTION.WITHDRAW, SCREEP_ACTION.TRANSFER, SCREEP_ACTION.DROP],
];

function canDoBoth(a : any, b : any) {
	return !ACTION_PIPELINES.some(pipeline => pipeline.includes(a) && pipeline.includes(b));
}

function comparePriority(a : any, b : any) {
	const pipeline = ACTION_PIPELINES.find(pipeline => pipeline.includes(a) && pipeline.includes(b));
	if (pipeline) 
        return pipeline.indexOf(a) - pipeline.indexOf(b);
	else return 0;
} */