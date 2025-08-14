import { CreepClassifier } from "../CreepClassifier";
import { Role } from "../Role";
import { builderRole } from "./Builder";
import { haulerRole } from "./Hauler";
import { kiterRole } from "./Kiter";
import { medicRole } from "./Medic";
import { raiderRole } from "./Raider";

export const roles = [haulerRole, builderRole, kiterRole, raiderRole, medicRole];
export const classifier = new CreepClassifier<Role>();
roles.forEach(role => classifier.add(role, role.features));
