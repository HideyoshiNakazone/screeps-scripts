import SpawnHandler from "spawnHandler";

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
        pos: RoomPosition;
        maxHarvesters: number|null;
        currentHarvesters: number;
    }

    interface GameState {
        sourcesStates: { [sourceId: string]: SourceState };
    }

    // Memory extension samples
    interface Memory {
        uuid: number;
        log: any;
        spawnStates: { [name: string]: GameState };
    }

    interface CreepMemory {
        role: string;
        room: string;
        working: boolean;
    }

    // Syntax for adding proprties to `global` (ex "global.log")
    namespace NodeJS {
        interface Global {
            log: any;
        }
    }
}


export const loop = () => {
    Memory.spawnStates = Memory.spawnStates || {};

    for (const spawnName of Object.keys(Game.spawns)) {
        const spawnState = Memory.spawnStates[spawnName] || {};

        const spawnHandler = new SpawnHandler(Game.spawns[spawnName]);

        Memory.spawnStates[spawnName] = spawnHandler.run(spawnState);
    }
};
