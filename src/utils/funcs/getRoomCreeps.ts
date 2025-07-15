export const getRoomCreeps = (room: Room): Record<string, CreepMemory> => {
    return Object.keys(Memory.creeps)
        .filter(name => Memory.creeps[name].room === room.name)
        .reduce((creeps: Record<string, CreepMemory>, creepName: string) => {
            creeps[creepName] = Memory.creeps[creepName];
            return creeps;
        }, {});
};
