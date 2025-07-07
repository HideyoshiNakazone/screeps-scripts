import getSourceById from "utils/funcs/get_source_by_id";
import { RoleHandler } from "./roleHandler.interface";



class HarvesterHandler extends RoleHandler {
    public static run(creep: Creep, state: GameState): GameState {
        const source = this.findClosestSource(creep, state);

        console.log(`Running HarvesterHandler for creep: ${creep.name}`);
        if (creep.store.getFreeCapacity() > 0) {
            if (creep.harvest(source) === ERR_NOT_IN_RANGE) {
                creep.moveTo(source, { reusePath: true });
            }
        } else {
            const spawn = Game.spawns['Spawn1'];
            if (creep.transfer(spawn, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                creep.moveTo(spawn, { reusePath: true });
            }
        }

        return state;
    }

    private static findClosestSource(creep: Creep, state: GameState): Source|null {
        for (const source of creep.room.find(FIND_SOURCES)) {

        }

        let closestSourceId = null;
        for (const sourceId in state.sourcesStates) {
            if (!closestSourceId) {
                closestSourceId = sourceId;
            }
            const sourceInfo = state.sourcesStates[sourceId];
            const creepPos = creep.pos;
            if (creepPos.getRangeTo(sourceInfo["pos"]) < creepPos.getRangeTo(state.sourcesStates[closestSourceId]["pos"])) {
                closestSourceId = sourceId;
            }
        }

        if (!closestSourceId) {
            console.warn(`No sources found for creep: ${creep.name}`);
            return null;
        }

        return getSourceById(closestSourceId);
    }
}





export default HarvesterHandler;
