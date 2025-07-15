import { CreepRequisition, CreepRole, CreepRoles, RoleDefinition } from "types/creeps";

export const sortCreepRolesByPriority = (requisition: CreepRequisition): RoleDefinition[] => {
    return Object.keys(requisition)
        .filter(role => requisition[role as CreepRole] > 0)
        .map(role => CreepRoles[role as CreepRole])
        .sort((a, b) => a.priority - b.priority);
};
