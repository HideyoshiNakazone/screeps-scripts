import { CreepRequisition, CreepRole, CreepRoles, RoleDefinition } from "types/creeps";
import { DEFAULT_GAME_CONFIG } from "types/gameConfig";
import { createSourcePositionMatrix, forEachMatrixSpot, getPositionWithDelta, setSpotStatus, SourceSpotStatus } from "types/source";
import { checkPositionWalkable } from "utils/funcs/check_position";
import { get_role_const as get_role_cost } from "utils/funcs/get_role_const";

class RoomRunner {
    public static run(room: Room, state: GameState): GameState {
        this.updateSpawnState(room, state);

        for(const name in this.getRoomCreeps(room)) {
            if (!Game.creeps[name]) {
                console.log(`Creep ${name} is dead, cleaning up memory.`);

                const roleDefinition = CreepRoles[Memory.creeps[name].role as CreepRole];
                roleDefinition.handler.destroy(Memory.creeps[name], state);
                delete Memory.creeps[name]; // Clean up memory for dead creeps

                continue; // Skip to the next creep
            }
            const creep = Game.creeps[name];

            const roleDefinition = CreepRoles[creep.memory.role as CreepRole];
            if (!roleDefinition) {
                console.log(`Creep ${creep.name} has an unknown role: ${creep.memory.role}`);
                continue;
            }

            state = roleDefinition.handler.run(creep, state);
        }

        for (const spawn of room.find(FIND_MY_SPAWNS)) {
            this.validateSpawnState(spawn, state);
        }

        return state;
    }

    private static getRoomCreeps(room: Room): Record<string, CreepMemory> {
        return Object.keys(Memory.creeps)
            .filter(name => Memory.creeps[name].room === room.name)
            .reduce((creeps: Record<string, CreepMemory>, creepName: string) => {
                creeps[creepName] = Memory.creeps[creepName];
                return creeps;
            }, {});
    }

    private static updateSpawnState(room: Room, state: GameState) {
        const sources = room.find(FIND_SOURCES);
        if (!state.sourcesStates) {
            state.sourcesStates = {};
            state.maxHarvesters = 0
        }
        for (const source of sources) {
            const sourceId = source.id.toString();

            if (!state.sourcesStates[sourceId]) {
                state.sourcesStates[sourceId] = {
                    "id": sourceId,
                    "pos": source.pos,
                    "spots": createSourcePositionMatrix(),
                };
                forEachMatrixSpot(state.sourcesStates[sourceId].spots, (delta, status) => {
                    if (status !== SourceSpotStatus.UNKNOWN) {
                        return; // Skip known spots
                    }
                    const pos = getPositionWithDelta(source.pos, delta);
                    if (checkPositionWalkable(pos)) {
                        setSpotStatus(state.sourcesStates[sourceId].spots, delta, SourceSpotStatus.EMPTY);
                        state.maxHarvesters = state.maxHarvesters + 1;
                    } else {
                        setSpotStatus(state.sourcesStates[sourceId].spots, delta, SourceSpotStatus.INVALID);
                    }
                })
            }
        }
    }

    private static validateSpawnState(spawn: StructureSpawn, state: GameState) {
        if (spawn.spawning) {
            // console.log(`Spawn ${this.spawn.name} is currently spawning a creep.`);
            return;
        }

        const creepRequisition = this.checksNeedsCreeps(spawn.room);
        if (Object.values(creepRequisition).every(count => count <= 0)) {
            // console.log(`Spawn ${this.spawn.name} has no creep needs.`);
            return;
        }

        const totalCreeps = Object.values(Game.creeps).length;
        if (totalCreeps >= state.maxHarvesters) {
            return;
        }

        const rolesToSpawn = this.sortCreepRolesByPriority(creepRequisition);

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
                return; // Exit after spawning one creep
            } else {
                console.error(`Spawn ${spawn.name} failed to spawn a new ${role.name}: ${spawnResult}`);
            }
        }
    }

    private static checksNeedsCreeps(room: Room): CreepRequisition {
        const creepCounts: Record<string, number> = {};
        for (const creepMemory of Object.values(this.getRoomCreeps(room))) {
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

    private static sortCreepRolesByPriority(requisition: CreepRequisition): RoleDefinition[] {
        return Object.keys(requisition)
            .filter(role => requisition[role as CreepRole] > 0)
            .map(role => CreepRoles[role as CreepRole])
            .sort((a, b) => a.priority - b.priority);
    }
}

export default RoomRunner;
