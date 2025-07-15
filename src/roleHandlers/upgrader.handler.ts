import { getControllerById, getSourceById } from "utils/funcs/getById";
import { RoleHandler } from "./BaseHandler.interface";
import { getNextEmptySpot, PositionSpotStatus, setSpotStatus, getPositionWithDelta } from "utils/positions";
import { SourceDestination } from "types/creeps";

class UpgraderHandler extends RoleHandler {
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
            case "controller":
                this.onControllerDestination(creep, state);
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
        if (!!creep.memory.previousDestination && creep.memory.previousDestination.type === "source") {
            setSpotStatus(
                state.sourcesStates[creep.memory.previousDestination.id].spots,
                creep.memory.previousDestination.sourceSpot,
                PositionSpotStatus.EMPTY
            );
            delete creep.memory.previousDestination;
        }

        if (!creep.memory.destination) {
            return; // No destination set, nothing to validate
        }

        if (creep.memory.destination.type === "source" && !creep.store.getFreeCapacity(RESOURCE_ENERGY)) {
            creep.memory.previousDestination = creep.memory.destination;

            if (!creep.room.controller) {
                console.log(`Creep ${creep.name} has no valid controller to upgrade.`);
                delete creep.memory.destination;
                return;
            }

            creep.memory.destination = {
                id: creep.room.controller.id,
                type: "controller"
            };
            return;
        }

        if (creep.memory.destination.type === "controller" && creep.store.getUsedCapacity(RESOURCE_ENERGY) === 0) {
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

            setSpotStatus(sourceState.spots, emptySpot, PositionSpotStatus.OCCUPIED);
            creep.memory.destination = {
                id: source.id,
                type: "source",
                sourceSpot: emptySpot
            };
            return;
        }

        console.log(`Creep ${creep.name} could not find a valid source.`);
    }

    private static onSourceDestination(creep: Creep, _state: GameState) {
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
            const sourceSpotPosition = getPositionWithDelta(source.pos, creep.memory.destination.sourceSpot);
            creep.moveTo(sourceSpotPosition, {
                reusePath: 10,
                visualizePathStyle: { stroke: "#ffffff", lineStyle: "dashed", strokeWidth: 0.1 }
            });
        }
    }

    private static onControllerDestination(creep: Creep, _state: GameState) {
        if (creep.memory.destination === undefined) {
            if (!creep.room.controller) {
                console.log(`Creep ${creep.name} has no valid controller to upgrade.`);
                delete creep.memory.destination;
                return;
            }
            creep.memory.destination = {
                id: creep.room.controller.id,
                type: "controller"
            };
        }

        const controller = getControllerById(creep.memory.destination.id);
        if (!controller) {
            console.log(`Spawn not found for creep: ${creep.name}`);
            return;
        }

        if (creep.upgradeController(controller) === ERR_NOT_IN_RANGE) {
            creep.moveTo(controller, {
                reusePath: 10,
                visualizePathStyle: { stroke: "#ffffff", lineStyle: "dashed", strokeWidth: 0.1 }
            });
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

        setSpotStatus(sourceState.spots, destination.sourceSpot, PositionSpotStatus.EMPTY);
    }
}

export default UpgraderHandler;
