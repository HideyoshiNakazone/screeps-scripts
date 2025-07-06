import { CreepRole } from "types/creeps";


export interface RoleHandler {
    mappedRole: CreepRole;

    run(creep: Creep): void;
}


export const ImplementationRegistry: { [roleName: string]: RoleHandler } = {};


export const registerRoleHandler = (roleName: string, handler: typeof RoleHandler) => {
    if (ImplementationRegistry[roleName]) {
        console.warn(`Role handler for ${roleName} is already registered. Overwriting.`);
    }
    ImplementationRegistry[roleName] = handler;
}
