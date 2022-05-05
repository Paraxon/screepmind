"use strict";

export function run() {
	let friendlies = Utils.getObjectsByPrototype(Protos.Creep).filter((creep) => creep.my);
	let killbots = friendlies.filter((creep) => creep.body.some((part) => part.type === Consts.ATTACK));
	let workers = friendlies.filter((creep) => creep.body.some((part) => part.type === Consts.CARRY));

	let spawner = Utils.getObjectById(spawnerID);
	if (workers.length < WORKER_COUNT) {
		Utils.getObjectById(spawnerID).spawnCreep(
			screep_templates.delivery.with_speed(1).with_budget(spawner.store.getUsedCapacity(Consts.RESOURCE_ENERGY)).spawn
		);
	} else if (killbots.length < KILLBOT_COUNT) {
		Utils.getObjectById(spawnerID).spawnCreep(
			screep_templates.killbot.with_speed(1).with_budget(spawner.store.getUsedCapacity(Consts.RESOURCE_ENERGY)).spawn
		);
	}

	workers.forEach((worker) => update_worker(worker));
	killbots.forEach((killbot) => attack_enemy(killbot));
}

export function attack_enemy(killbot) {
	let target = Utils.getObjectsByPrototype(Protos.StructureSpawn).filter((creep) => !creep.my)[0];
	if (killbot.attack(target) === Consts.ERR_NOT_IN_RANGE) {
		killbot.moveTo(target);
	}
}

export function update_worker(worker) {
	if (!worker.store.getFreeCapacity()) {
		let spawner = Utils.getObjectById(spawnerID);
		if (worker.transfer(spawner, Consts.RESOURCE_ENERGY) === Consts.ERR_NOT_IN_RANGE) {
			worker.moveTo(spawner);
		}
	} else {
		let containers = Utils.getObjectsByPrototype(Protos.StructureContainer).filter(
			(container) => container.store.getUsedCapacity(Consts.RESOURCE_ENERGY) > 0
		);
		let target = Utils.findClosestByRange(worker, containers);
		if (worker.withdraw(target, Consts.RESOURCE_ENERGY) === Consts.ERR_NOT_IN_RANGE) {
			worker.moveTo(target);
		}
	}
}

export function update_killbot(killbot) {
	let enemies = Utils.getObjectsByPrototype(Protos.Creep).filter((creep) => !creep.my);
	let targets = Utils.findInRange(killbot, enemies, 3);
	let spawner = Utils.getObjectById(spawnerID);
	if (targets.length > 0) {
		// Attack the lowest HP enemy in range
		let target = targets.sort((a, b) => a.hits - b.hits)[0];
		if (killbot.attack(target) === Consts.ERR_NOT_IN_RANGE) {
			killbot.moveTo(target);
		}
	} else if (Utils.getRange(killbot, spawner) <= 1 && enemies.length > 0) {
		// Move Away from Spawner, toward enemy
		let direction = Utils.getDirection(enemies[0].x - killbot.x, enemies[0].y - killbot.y);
		killbot.move(direction);
	}
}