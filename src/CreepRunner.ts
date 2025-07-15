import { CreepRole, CreepRoles } from "types/creeps";
import { getRoomCreeps } from "utils/funcs/getRoomCreeps";

class CreepRunner {
    public static run(room: Room, state: GameState): GameState {
        for (const name in getRoomCreeps(room)) {
            const creep = Game.creeps[name];

            if (!creep) {
                this.clearDeadCreepMemory(name, state);
                continue;
            }

            const roleDefinition = CreepRoles[creep.memory.role as CreepRole];
            if (!roleDefinition) {
                this.clearDeadCreepMemory(name, state);
                continue;
            }

            state = roleDefinition.handler.run(creep, state);
        }

        return state;
    }

    private static clearDeadCreepMemory(creepName: string, state: GameState): void {
        console.log(`Creep ${creepName} is dead, cleaning up memory.`);

        const roleDefinition = CreepRoles[Memory.creeps[creepName].role as CreepRole];
        roleDefinition.handler.destroy(Memory.creeps[creepName], state);

        delete Memory.creeps[creepName]; // Clean up memory for dead creeps
    }
}

export default CreepRunner;
