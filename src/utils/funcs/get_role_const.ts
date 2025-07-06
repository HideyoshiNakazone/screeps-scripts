import { RoleDefinition } from "types/creeps";

export const get_role_const = (role: RoleDefinition) => {
    return role.body.reduce((cost, part) => {
        cost += BODYPART_COST[part] || 0;
        return cost;
    }, 0);
};
