import { CreepDestination } from "types/creeps";
import RoomRunner from "RoomRunner";
import { PositionMatrix } from "utils/positions";

declare global {
    /*
    Example types, expand on these or remove them and add your own.
    Note: Values, properties defined here do no fully *exist* by this type definiton alone.
          You must also give them an implemention if you would like to use them. (ex. actually setting a `role` property in a Creeps memory)

    Types added in this `global` block are in an ambient, global context. This is needed because `main.ts` is a module file (uses import or export).
    Interfaces matching on name from @types/screeps will be merged. This is how you can extend the 'built-in' interfaces from @types/screeps.
  */
    interface SourceState {
        id: string;
        spots: PositionMatrix;
        pos: RoomPosition;
    }

    interface GameState {
        sourcesStates: { [sourceId: string]: SourceState };
        maxHarvesters: number; // Maximum number of harvesters allowed in the game
    }

    // Memory extension samples
    interface Memory {
        uuid: number;
        log: any;
        roomStateRegistry: { [name: string]: GameState };
    }

    interface CreepMemory {
        role: string;
        room: string;
        spawnId: string;
        working: boolean;
        destination?: CreepDestination;
        previousDestination?: CreepDestination;
    }

    // Syntax for adding proprties to `global` (ex "global.log")
    namespace NodeJS {
        interface Global {
            log: any;
        }
    }
}

export const loop = () => {
    Memory.roomStateRegistry = Memory.roomStateRegistry || {};

    for (const roomName of Object.keys(Game.rooms)) {
        Memory.roomStateRegistry[roomName] = RoomRunner.run(
            Game.rooms[roomName],
            Memory.roomStateRegistry[roomName] || {}
        );
    }
};
