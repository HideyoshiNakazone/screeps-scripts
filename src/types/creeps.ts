import { HarvesterHandler, RoleHandler, UpgraderHandler } from "roleHandlers";
import { PositionDelta } from "./source";

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
        handler: UpgraderHandler,
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




export type SpawnDestination = {
    id: string; // ID of the spawn
    type: "spawn";
}

export type SourceDestination = {
    id: string; // ID of the source
    type: "source";
    sourceSpot: PositionDelta; // Position delta for the source spot
}

export type ControllerDestination = {
    id: string; // ID of the controller
    type: "controller";
}

export type ConstructionSiteDestination = {
    id: string; // ID of the construction site
    type: "constructionSite";
}


export type CreepDestination = (
    SpawnDestination |
    SourceDestination |
    ControllerDestination |
    ConstructionSiteDestination
);

