export type RoleDefinition = {
    name: string;
    body: BodyPartConstant[];
    priority: number;
}


export const CreepRoles = {
    harvester: {
        name: "harvester",
        body: [WORK, CARRY, MOVE],
        priority: 1
    },
    upgrader: {
        name: "upgrader",
        body: [WORK, CARRY, MOVE],
        priority: 2
    },
    builder: {
        name: "builder",
        body: [WORK, CARRY, MOVE],
        priority: 3
    }
} satisfies Record<string, RoleDefinition>;


export type CreepRole = keyof typeof CreepRoles;



export type CreepRequisition = Record<CreepRole, number>;
