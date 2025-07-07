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

        // for(const name in Game.creeps) {
        //     const creep = Game.creeps[name];

        //     const roleDefinition = CreepRoles[creep.memory.role as CreepRole];
        //     if (!roleDefinition) {
        //         console.warn(`Creep ${creep.name} has an unknown role: ${creep.memory.role}`);
        //         continue;
        //     }

        //     state = roleDefinition.handler.run(creep, state);
        // }

        this.validateSpawnState();

        return state;
    }

    private updateSpawnState(state: GameState) {
        const sources = this.spawn.room.find(FIND_SOURCES);
        for (const source of sources) {
            if (!state.sourcesStates) {
                state.sourcesStates = {};
            }
            const sourceId = source.id.toString();
            if (!state.sourcesStates[sourceId]) {
                state.sourcesStates[sourceId] = {
                    "id": sourceId,
                    "pos": source.pos,
                    "spots": createSourcePositionMatrix(),
                    "currentHarvesters": 0
                };
                forEachMatrixSpot(state.sourcesStates[sourceId].spots, (delta, status) => {
                    if (status !== SourceSpotStatus.UNKNOWN) {
                        return; // Skip known spots
                    }
                    const pos = getPositionWithDelta(source.pos, delta);
                    if (checkPositionWalkable(pos)) {
                        setSpotStatus(state.sourcesStates[sourceId].spots, delta, SourceSpotStatus.EMPTY);
                    } else {
                        setSpotStatus(state.sourcesStates[sourceId].spots, delta, SourceSpotStatus.INVALID);
                    }
                })

            }
        }
    }

    private validateSpawnState() {
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
                console.warn(`Unknown creep role: ${role}`);
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
