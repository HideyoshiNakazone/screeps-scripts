import { getSourceById, getSpawnById } from "utils/funcs/get_by_id";
import { RoleHandler } from "./roleHandler.interface";
import { getNextEmptySpot } from "types/source";



class HarvesterHandler extends RoleHandler {
    public static run(creep: Creep, state: GameState): GameState {
        switch (creep.memory.destination?.type) {
            case "spawn":
                this.onSpawnDestination(creep, state);
                break;
            default:
                this.onSourceDestination(creep, state);
                break;
        }

        return state;
    }

    private static onSourceDestination(creep: Creep, state: GameState) {
        if (!creep.memory.destination) {
            const sources = this.findClosestSource(creep, state);
            if (sources.length > 0) {
                creep.memory.destination = {
                    id: sources[0].id,
                    type: "source",
                    sourceSpot: getNextEmptySpot(state.sourcesStates[sources[0].id].spots) || { x: 0, y: 0 }
                };
            } else {
                console.warn(`No sources found for creep: ${creep.name}`);
                return;
            }
        }

        const source = getSourceById(creep.memory.destination.id);
        if (!source) {
            console.warn(`Source not found for creep: ${creep.name}`);
            return;
        }

        if (creep.harvest(source) === ERR_NOT_IN_RANGE) {
            creep.moveTo(source, { reusePath: true });
        }
    }

    private static onSpawnDestination(creep: Creep, state: GameState) {
        if (!creep.memory.destination) {
            creep.memory.destination = {
                id: creep.memory.spawnId,
                type: "spawn"
            }
        }
        if (creep.store.getFreeCapacity() <= 0) {
            delete creep.memory.destination;
            return;
        }

        const spawn = getSpawnById(creep.memory.destination.id);
        if (!spawn) {
            console.warn(`Spawn not found for creep: ${creep.name}`);
            return;
        }

        if (creep.transfer(spawn, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
            creep.moveTo(spawn, { reusePath: true });
        }
    }



    private static findClosestSource(creep: Creep, state: GameState): Source[] {
        return Object.keys(state.sourcesStates)
            .map(sourceId => getSourceById(sourceId))
            .filter(source => source !== null)
            .sort((a, b) => creep.pos.getRangeTo(a) - creep.pos.getRangeTo(b));
    }
}





export default HarvesterHandler;
