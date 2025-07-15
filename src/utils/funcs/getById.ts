export const getSourceById = (sourceId: string): Source | null => {
    if (!sourceId) {
        console.log("getSourceById called with an empty or undefined sourceId.");
        return null;
    }

    const source = Game.getObjectById<Source>(sourceId);
    if (!source) {
        console.log(`No source found with ID: ${sourceId}`);
        return null;
    }

    return source;
};

export const getSpawnById = (spawnId: string): StructureSpawn | null => {
    if (!spawnId) {
        console.log("getSpawnById called with an empty or undefined spawnId.");
        return null;
    }

    const spawn = Game.getObjectById<StructureSpawn>(spawnId);
    if (!spawn) {
        console.log(`No spawn found with ID: ${spawnId}`);
        return null;
    }

    return spawn;
};

export const getControllerById = (controllerId: string): StructureController | null => {
    if (!controllerId) {
        console.log("getControllerById called with an empty or undefined controllerId.");
        return null;
    }

    const controller = Game.getObjectById<StructureController>(controllerId);
    if (!controller) {
        console.log(`No controller found with ID: ${controllerId}`);
        return null;
    }

    return controller;
};
