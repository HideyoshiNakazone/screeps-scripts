import { CreepRequisition, CreepRole, CreepRoles } from "types/creeps";
import { DEFAULT_GAME_CONFIG } from "types/gameConfig";
import { get_role_cost } from "utils/funcs/getRoleCost";
import { getRoomCreeps } from "utils/funcs/getRoomCreeps";
import { sortCreepRolesByPriority } from "utils/funcs/sortCreepRolesByPriority";

class RequisitionsManager {
    public static validateState(room: Room, state: GameState): GameState {
        const creepRequisition = this.getRoomRequisition(room);

        if (Object.values(creepRequisition).every(count => count <= 0)) {
            return state;
        }

        const totalCreeps = Object.values(room.find(FIND_MY_CREEPS)).length;
        if (totalCreeps >= state.maxHarvesters) {
            return state; // No need to spawn more creeps
        }

        for (const spawn of room.find(FIND_MY_SPAWNS)) {
            const requestResult = this.fulfillSpawnRequisition(spawn, creepRequisition);

            if (requestResult) {
                console.log(`Spawn ${spawn.name} has fulfilled a creep requisition.`);
            } else {
                console.log(`Spawn ${spawn.name} could not fulfill any creep requisition.`);
            }
        }

        return state;
    }

    private static fulfillSpawnRequisition(spawn: StructureSpawn, creepRequisition: CreepRequisition): boolean {
        if (spawn.spawning) {
            return false;
        }

        const rolesToSpawn = sortCreepRolesByPriority(creepRequisition);

        for (const role of rolesToSpawn) {
            if (spawn.store[RESOURCE_ENERGY] < get_role_cost(role)) {
                continue;
            }

            const newName = `${role.name}_${Game.time}`;
            const spawnResult = spawn.spawnCreep(role.body, newName, {
                memory: {
                    role: role.name,
                    room: spawn.room.name,
                    spawnId: spawn.id,
                    working: false
                }
            });
            if (spawnResult === OK) {
                console.log(`Spawn ${spawn.name} successfully spawned a new ${role.name}: ${newName}.`);
                return true; // Exit after spawning one creep
            } else {
                console.error(`Spawn ${spawn.name} failed to spawn a new ${role.name}: ${spawnResult}`);
            }
        }

        return false; // No creeps were spawned
    }

    private static getRoomRequisition(room: Room): CreepRequisition {
        const creepCounts: Record<string, number> = {};
        for (const creepMemory of Object.values(getRoomCreeps(room))) {
            const role = creepMemory.role;
            creepCounts[role] = (creepCounts[role] || 0) + 1;
        }

        const requisition: CreepRequisition = {
            harvester: 0,
            upgrader: 0,
            builder: 0
        };
        for (const role in DEFAULT_GAME_CONFIG.minCreepsPerRole) {
            if (!(role in CreepRoles)) {
                console.log(`Unknown creep role: ${role}`);
                continue;
            }
            const roleType = role as CreepRole;
            requisition[roleType] = DEFAULT_GAME_CONFIG.minCreepsPerRole[roleType] - (creepCounts[role] || 0);

            if (requisition[roleType] < 0) {
                requisition[roleType] = 0; // Ensure we don't have negative requisitions
            }
        }

        return requisition;
    }
}

export default RequisitionsManager;
