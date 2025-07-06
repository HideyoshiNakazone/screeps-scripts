import { CreepRole } from "types/creeps";
import { registerRoleHandler, RoleHandler } from "./roleHandler.interface";



class HarvesterHandler implements RoleHandler {
    public readonly mappedRole: CreepRole = "harvester";

    public run(creep: Creep): void {
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


registerRoleHandler("harvester", HarvesterHandler);



export default HarvesterHandler;
