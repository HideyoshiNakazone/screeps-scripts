export abstract class RoleHandler {
    public static destroy(_creepMemory: CreepMemory, _state: GameState): void {
        // Default implementation does nothing
        // Subclasses should override this method
    }

    public static run(_creep: Creep, state: GameState): GameState {
        // Default implementation returns state unchanged
        // Subclasses should override this method
        return state;
    }
}
