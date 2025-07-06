import { RoleHandler } from "./roleHandler.interface";



class HarvesterHandler extends RoleHandler {
    public static run(creep: Creep): void {
        console.log(`Running HarvesterHandler for creep: ${creep.name}`);
        if (creep.store.getFreeCapacity() > 0) {
            const sources = creep.room.find(FIND_SOURCES);
            if (creep.harvest(sources[0]) === ERR_NOT_IN_RANGE) {
                creep.moveTo(sources[0]);
            }
        } else {
            const spawn = Game.spawns['Spawn1'];
            if (creep.transfer(spawn, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                creep.moveTo(spawn);
            }
        }
    }
}





export default HarvesterHandler;
