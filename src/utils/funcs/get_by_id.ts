export const getSourceById = (sourceId: string): Source | null => {
    if (!sourceId) {
        console.warn("getSourceById called with an empty or undefined sourceId.");
        return null;
    }

    const source = Game.getObjectById<Source>(sourceId);
    if (!source) {
        console.warn(`No source found with ID: ${sourceId}`);
        return null;
    }

    return source;
}


export const getSpawnById = (spawnId: string): StructureSpawn | null => {
    if (!spawnId) {
        console.warn("getSpawnById called with an empty or undefined spawnId.");
        return null;
    }

    const spawn = Game.getObjectById<StructureSpawn>(spawnId);
    if (!spawn) {
        console.warn(`No spawn found with ID: ${spawnId}`);
        return null;
    }

    return spawn;
}
