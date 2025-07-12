export abstract class RoleHandler {
    static destroy(creepMemory: CreepMemory, state: GameState): void {};
    static run(creep: Creep, state: GameState): GameState {};
}
