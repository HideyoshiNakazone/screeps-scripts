const getSourceById = (sourceId: string): Source | null => {
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


export default getSourceById;
