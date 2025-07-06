import { HarvesterHandler, RoleHandler } from "roleHandlers";

export type RoleDefinition = {
    name: string;
    body: BodyPartConstant[];
    handler: RoleHandler;
    priority: number;
};

export const CreepRoles = {
    harvester: {
        name: "harvester",
        body: [WORK, CARRY, MOVE],
        handler: HarvesterHandler,
        priority: 1
    },
    upgrader: {
        name: "upgrader",
        body: [WORK, CARRY, MOVE],
        handler: HarvesterHandler,
        priority: 2
    },
    builder: {
        name: "builder",
        body: [WORK, CARRY, MOVE],
        handler: HarvesterHandler,
        priority: 3
    }
} satisfies Record<string, RoleDefinition>;

export type CreepRole = keyof typeof CreepRoles;

export type CreepRequisition = Record<CreepRole, number>;
