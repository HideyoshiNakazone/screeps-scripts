import { getSourceById, getSpawnById } from "utils/funcs/getById";
import { RoleHandler } from "./BaseHandler.interface";
import { getNextEmptySpot, getPositionWithDelta, setSpotStatus, SourceSpotStatus } from "types/source";
import { SourceDestination } from "types/creeps";



class HarvesterHandler extends RoleHandler {
    public static destroy(creepMemory: CreepMemory, state: GameState): void {
        if (creepMemory.destination?.type === "source") {
            this.releaseSourceSpot(creepMemory.destination, state);
            delete creepMemory.destination; // Clear destination after releasing the spot
        }
        if (creepMemory.previousDestination?.type === "source") {
            this.releaseSourceSpot(creepMemory.previousDestination, state);
            delete creepMemory.previousDestination; // Clear previous destination after releasing the spot
        }
    }

    public static run(creep: Creep, state: GameState): GameState {
        this.validateCreepMemory(creep, state);

        switch (creep.memory.destination?.type) {
            case "spawn":
                this.onSpawnDestination(creep, state);
                break;
            case "source":
                this.onSourceDestination(creep, state);
                break;
            default:
                this.onFindNewSource(creep, state);
                break;
        }

        return state;
    }

    private static validateCreepMemory(creep: Creep, state: GameState) {
        if (creep.memory.previousDestination?.type === "source") {
            setSpotStatus(
                state.sourcesStates[creep.memory.previousDestination.id].spots,
                creep.memory.previousDestination.sourceSpot,
                SourceSpotStatus.EMPTY
            );
            delete creep.memory.previousDestination;
        }

        if (!creep.memory.destination) {
            return; // No destination set, nothing to validate
        }

        if (creep.memory.destination.type === "source" && !creep.store.getFreeCapacity(RESOURCE_ENERGY)) {
            creep.memory.previousDestination = creep.memory.destination;
            creep.memory.destination = {
                id: creep.memory.spawnId,
                type: "spawn"
            };
            return;
        }

        if (creep.memory.destination.type === "spawn" && creep.store.getUsedCapacity(RESOURCE_ENERGY) === 0) {
            delete creep.memory.destination; // Clear destination if no energy is available
            return;
        }
    }

    private static onFindNewSource(creep: Creep, state: GameState) {
        if (creep.memory.destination) {
            console.log(`Creep ${creep.name} already has a destination set.`);
            return; // Already has a destination, no need to find a new one
        }

        const sources = this.findClosestSource(creep, state);

        for (const source of sources) {
            const sourceState = state.sourcesStates[source.id];
            const emptySpot = getNextEmptySpot(sourceState.spots);

            if (emptySpot === null) {
                continue; // No empty spots available, skip to next source
            }

            setSpotStatus(
                sourceState.spots,
                emptySpot,
                SourceSpotStatus.OCCUPIED
            );
            creep.memory.destination = {
                id: source.id,
                type: "source",
                sourceSpot: emptySpot
            };
            return
        }

        console.log(`Creep ${creep.name} could not find a valid source.`);
    }

    private static onSourceDestination(creep: Creep, state: GameState) {
        if (!creep.memory.destination || creep.memory.destination.type !== "source") {
            console.log(`Creep ${creep.name} has no valid destination set.`);
            delete creep.memory.destination;
            return;
        }

        const source = getSourceById(creep.memory.destination.id);
        if (source === null) {
            console.log(`Source not found for creep: ${creep.name}`);
            return;
        }

        if (creep.harvest(source) === ERR_NOT_IN_RANGE) {
            const sourceSpotPosition = getPositionWithDelta(
                source.pos, creep.memory.destination.sourceSpot
            )
            creep.moveTo(sourceSpotPosition, { reusePath: 10, visualizePathStyle: { stroke: '#ffffff', lineStyle: 'dashed', strokeWidth: 0.1 } });
        }
    }

    private static onSpawnDestination(creep: Creep, state: GameState) {
        if (creep.memory.destination === undefined) {
            creep.memory.destination = {
                id: creep.memory.spawnId,
                type: "spawn"
            }
        }

        const spawn = getSpawnById(creep.memory.destination.id);
        if (!spawn) {
            console.log(`Spawn not found for creep: ${creep.name}`);
            return;
        }

        if (creep.transfer(spawn, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
            creep.moveTo(spawn, { reusePath: 10, visualizePathStyle: { stroke: '#ffffff', lineStyle: 'dashed', strokeWidth: 0.1 } });
        }
    }



    private static findClosestSource(creep: Creep, state: GameState): Source[] {
        const sources = Object.keys(state.sourcesStates)
            .map(sourceId => getSourceById(sourceId))
            .filter(source => source !== null)
            .sort((a, b) => creep.pos.getRangeTo(a) - creep.pos.getRangeTo(b));

        return sources as Source[];
    }

    private static releaseSourceSpot(destination: SourceDestination, state: GameState) {
        if (!destination || destination.type !== "source") {
            return; // Not a source destination, nothing to release
        }

        const sourceState = state.sourcesStates[destination.id];
        if (!sourceState) {
            console.log(`Source state not found for ID: ${destination.id}`);
            return;
        }

        setSpotStatus(
            sourceState.spots,
            destination.sourceSpot,
            SourceSpotStatus.EMPTY
        );
    }
}





export default HarvesterHandler;
