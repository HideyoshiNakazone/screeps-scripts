import SpawnHandler from "spawnHandler";

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
        spawnHandlers: { [name: string]: SpawnHandler };
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

// When compiling TS to JS and bundling with rollup, the line numbers and file names in error messages change
// This utility uses source maps to get the line numbers and file names of the original, TS source code
// export const loop = ErrorMapper.wrapLoop(() => {
//   console.log(`Current game tick is ${Game.time}`);

//   // Automatically delete memory of missing creeps
//   for (const name in Memory.creeps) {
//     if (!(name in Game.creeps)) {
//       delete Memory.creeps[name];
//     }
//   }
// });
export const loop = () => {
    Memory.spawnHandlers = Memory.spawnHandlers || {};

    console.log(`Current game tick is ${Game.time}`);

    // Check if spawn still exists
    const activeSpawns = Object.keys(Game.spawns);

    for (const spawnName in Object.keys(Memory.spawnHandlers)) {
        if (spawnName in Game.spawns) {
            console.log(`Spawn ${spawnName} exists, continuing to run its handler.`);
            continue;
        }
        console.log(`Spawn ${spawnName} does not exist, deleting its handler.`);
        delete Memory.spawnHandlers[spawnName];
    }

    for (const spawnName of activeSpawns) {
        // Create a handler for each spawn
        if (spawnName in Memory.spawnHandlers) {
            Memory.spawnHandlers[spawnName] = new SpawnHandler(Game.spawns[spawnName]);
        }
        // Run the handler
        Memory.spawnHandlers[spawnName].run();
    }
};
