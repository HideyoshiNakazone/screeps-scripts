import { CreepRequisition, CreepRole, CreepRoles, RoleDefinition } from "types/creeps";
import { DEFAULT_GAME_CONFIG } from "types/gameConfig";
import { createSourcePositionMatrix, forEachMatrixSpot, getPositionWithDelta, setSpotStatus, SourceSpotStatus } from "types/source";
import { checkPositionWalkable } from "utils/funcs/check_position";
import { get_role_const as get_role_cost } from "utils/funcs/get_role_const";

class SpawnHandler {
    constructor(private spawn: StructureSpawn) {}

    public get spawnName(): string {
        return this.spawn.name;
    }

    public run(state: GameState): GameState {
        this.updateSpawnState(state);

        for(const name in Memory.creeps) {
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

        this.validateSpawnState();

        return state;
    }

    private updateSpawnState(state: GameState) {
        const sources = this.spawn.room.find(FIND_SOURCES);
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

    private validateSpawnState() {
        if (this.spawn.spawning) {
            // console.log(`Spawn ${this.spawn.name} is currently spawning a creep.`);
            return;
        }

        const creepRequisition = this.checksNeedsCreeps();
        if (Object.values(creepRequisition).every(count => count <= 0)) {
            // console.log(`Spawn ${this.spawn.name} has no creep needs.`);
            return;
        }

        const totalCreeps = Object.values(Game.creeps).length;
        if (totalCreeps >= DEFAULT_GAME_CONFIG.maxCreeps) {
            // console.log(`Spawn ${this.spawn.name} cannot spawn more creeps, limit reached.`);
            return;
        }

        const rolesToSpawn = this.sortCreepRolesByPriority(creepRequisition);

        for (const role of rolesToSpawn) {
            if (this.spawn.store[RESOURCE_ENERGY] < get_role_cost(role)) {
                // console.log(`Spawn ${this.spawn.name} does not have enough energy to spawn a ${role.name}.`);
                continue;
            }

            const newName = `${role.name}_${Game.time}`;
            const spawnResult = this.spawn.spawnCreep(role.body, newName, {
                memory: {
                    role: role.name,
                    room: this.spawn.room.name,
                    spawnId: this.spawn.id,
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

    private sortCreepRolesByPriority(requisition: CreepRequisition): RoleDefinition[] {
        return Object.keys(requisition)
            .filter(role => requisition[role as CreepRole] > 0)
            .map(role => CreepRoles[role as CreepRole])
            .sort((a, b) => a.priority - b.priority);
    }
}

export default SpawnHandler;
