import { CreepRequisition, CreepRole, CreepRoles, RoleDefinition } from "types/creeps";
import { DEFAULT_GAME_CONFIG } from "types/gameConfig";
import { get_role_const as get_role_cost } from "utils/funcs/get_role_const";

class SpawnHandler {
    constructor(private spawn: StructureSpawn) {}

    public run(): void {
        if (this.spawn.spawning) {
            console.log(`Spawn ${this.spawn.name} is currently spawning a creep.`);
            return;
        }

        const creepRequisition = this.checksNeedsCreeps();
        if (Object.values(creepRequisition).every(count => count <= 0)) {
            console.log(`Spawn ${this.spawn.name} has no creep needs.`);
            return;
        }

        const totalCreeps = Object.values(Game.creeps).length;
        if (totalCreeps >= DEFAULT_GAME_CONFIG.maxCreeps) {
            console.log(`Spawn ${this.spawn.name} cannot spawn more creeps, limit reached.`);
            return;
        }

        const rolesToSpawn = this.sortCreepRolesByPriority(creepRequisition);

        for (const role of rolesToSpawn) {
            if (this.spawn.store[RESOURCE_ENERGY] < get_role_cost(role)) {
                console.log(`Spawn ${this.spawn.name} does not have enough energy to spawn a ${role.name}.`);
                continue;
            }

            const newName = `${role.name}_${Game.time}`;
            const spawnResult = this.spawn.spawnCreep(role.body, newName, {
                memory: {
                    role: role.name,
                    room: this.spawn.room.name,
                    working: false
                }
            });
            if (spawnResult === OK) {
                console.log(`Spawn ${this.spawn.name} successfully spawned a new ${role.name}: ${newName}.`);
                return; // Exit after spawning one creep
            } else {
                console.error(`Spawn ${this.spawn.name} failed to spawn a new ${role.name}: ${spawnResult}`);
            }
        }
    }

    private checksNeedsCreeps(): CreepRequisition {
        const creepCounts: Record<string, number> = {};
        for (const creep of Object.values(Game.creeps)) {
            const role = creep.memory.role;
            creepCounts[role] = (creepCounts[role] || 0) + 1;
        }

        const requisition: CreepRequisition = {
            harvester: 0,
            upgrader: 0,
            builder: 0
        };
        for (const role in DEFAULT_GAME_CONFIG.minCreepsPerRole) {
            if (!(role in CreepRoles)) {
                console.warn(`Unknown creep role: ${role}`);
                continue;
            }
            const roleType = role as CreepRole;
            requisition[roleType] = DEFAULT_GAME_CONFIG.minCreepsPerRole[roleType] - (creepCounts[role] || 0);
        }

        return requisition;
    }

    private sortCreepRolesByPriority(requisition: CreepRequisition): RoleDefinition[] {
        return Object.keys(requisition)
            .filter(role => requisition[role as CreepRole] > 0)
            .map(role => CreepRoles[role as CreepRole])
            .sort((a, b) => a.priority - b.priority);
    }
}

export default SpawnHandler;
