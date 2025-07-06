import SpawnHandler from "spawnHandler";

class SpawnStorage {
    constructor() {
        // Initialize the spawn storage
        if (!Memory.spawnHandlers) {
            Memory.spawnHandlers = {};
        }
    }

    get allHandlers(): { [name: string]: SpawnHandler } {
        const handlers: { [name: string]: SpawnHandler } = {};
        for (const spawnName in Memory.spawnHandlers) {
            const instance = this.getHandler(spawnName);
            if (!instance) {
                console.log(`No handler found for spawn: ${spawnName}`);
                continue;
            }
            handlers[spawnName] = instance;
        }
        return handlers;
    }

    // Method to get a spawn handler by name
    getHandler(spawnName: string): SpawnHandler | null {
        if (!Memory.spawnHandlers[spawnName]) {
            console.log(`No handler found for spawn: ${spawnName}`);
            return null;
        }
        const data = JSON.parse(Memory.spawnHandlers[spawnName]) as SpawnHandler;
        return Object.assign(new SpawnHandler(Game.spawns[spawnName]), data);
    }

    // Method to add or update a spawn handler
    addHandler(spawnName: string, handler: SpawnHandler): SpawnHandler {
        Memory.spawnHandlers[spawnName] = JSON.stringify(handler);
        return handler;
    }

    // Method to remove a spawn handler
    removeHandler(spawnName: string) {
        delete Memory.spawnHandlers[spawnName];
    }

    checkHandlerExists(spawnName: string): boolean {
        return !!Memory.spawnHandlers[spawnName];
    }

    clearDeadHandlers(activeSpawns: string[]) {
        for (const spawnName of Object.keys(this.allHandlers)) {
            if (!(spawnName in activeSpawns)) {
                continue;
            }
            this.removeHandler(spawnName);
        }
    }
}


export default SpawnStorage;
