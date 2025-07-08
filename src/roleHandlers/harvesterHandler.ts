import { getSourceById, getSpawnById } from "utils/funcs/get_by_id";
import { RoleHandler } from "./roleHandler.interface";
import { forEachMatrixSpot, getNextEmptySpot, getPositionWithDelta, setSpotStatus, SourceSpotStatus } from "types/source";



class HarvesterHandler extends RoleHandler {
    public static run(creep: Creep, state: GameState): GameState {
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

    private static onFindNewSource(creep: Creep, state: GameState) {
        if (creep.memory.destination) {
            console.log(`Creep ${creep.name} already has a destination set.`);
            return; // Already has a destination, no need to find a new one
        }

        const sources = this.findClosestSource(creep, state);

        for (const source of sources) {
            const sourceState = state.sourcesStates[source.id];
            const emptySpot = getNextEmptySpot(sourceState.spots);

            if (!emptySpot) {
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
            console.log(`Source ${creep.memory.destination.id} - `, state.sourcesStates[creep.memory.destination.id].spots)
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

        if (creep.store.getFreeCapacity(RESOURCE_ENERGY) === 0) {
            setSpotStatus(
                state.sourcesStates[creep.memory.destination.id].spots,
                creep.memory.destination.sourceSpot,
                SourceSpotStatus.EMPTY
            );
            console.log(`Source ${creep.memory.destination.id} - `, state.sourcesStates[creep.memory.destination.id].spots)
            creep.memory.destination = {
                id: creep.memory.spawnId,
                type: "spawn"
            };
            return;
        }

        const source = getSourceById(creep.memory.destination.id);
        if (!source) {
            console.log(`Source not found for creep: ${creep.name}`);
            return;
        }

        if (creep.harvest(source) === ERR_NOT_IN_RANGE) {
            const sourceSpotPosition = getPositionWithDelta(
                source.pos, creep.memory.destination.sourceSpot
            )
            creep.moveTo(sourceSpotPosition, { reusePath: true, ignoreCreeps: true });
        }
    }

    private static onSpawnDestination(creep: Creep, state: GameState) {
        if (!creep.memory.destination) {
            creep.memory.destination = {
                id: creep.memory.spawnId,
                type: "spawn"
            }
        }

        if (creep.store.getUsedCapacity(RESOURCE_ENERGY) === 0) {
            delete creep.memory.destination;
            return;
        }

        const spawn = getSpawnById(creep.memory.destination.id);
        if (!spawn) {
            console.log(`Spawn not found for creep: ${creep.name}`);
            return;
        }

        if (creep.transfer(spawn, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
            creep.moveTo(spawn, { reusePath: true, ignoreCreeps: true });
        }
    }



    private static findClosestSource(creep: Creep, state: GameState): Source[] {
        const sources = Object.keys(state.sourcesStates)
            .map(sourceId => getSourceById(sourceId))
            .filter(source => source !== null)
            .sort((a, b) => Math.abs(creep.pos.getRangeTo(a) - creep.pos.getRangeTo(b)))

        // console.log(`Creep ${creep.name} found ${sources.length} sources.`);

        return sources;
    }
}





export default HarvesterHandler;
