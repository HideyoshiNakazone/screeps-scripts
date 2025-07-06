import SpawnHandler from "spawnHandler";
import SpawnStorage from "spawnStorage";

declare global {
    /*
    Example types, expand on these or remove them and add your own.
    Note: Values, properties defined here do no fully *exist* by this type definiton alone.
          You must also give them an implemention if you would like to use them. (ex. actually setting a `role` property in a Creeps memory)

    Types added in this `global` block are in an ambient, global context. This is needed because `main.ts` is a module file (uses import or export).
    Interfaces matching on name from @types/screeps will be merged. This is how you can extend the 'built-in' interfaces from @types/screeps.
  */
    // Memory extension samples
    interface Memory {
        uuid: number;
        log: any;
        spawnHandlers: { [name: string]: string };
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
    const spawnStorage = new SpawnStorage();
    Memory.spawnHandlers = Memory.spawnHandlers || {};

    // Check if spawn still exists
    const activeSpawns = Object.keys(Game.spawns);

    spawnStorage.clearDeadHandlers(activeSpawns);

    for (const spawnName of activeSpawns) {
        // Create a handler for each spawn
        var currentHandler = spawnStorage.getHandler(spawnName);
        if (!currentHandler) {
            currentHandler = spawnStorage.addHandler(spawnName, new SpawnHandler(Game.spawns[spawnName]));
        }

        // Run the handler
        currentHandler.run();
    }
};
