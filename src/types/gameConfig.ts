import { CreepRequisition } from "./creeps";

/**
 * Configuration for the game, defining limits and minimum requirements for creeps.
 * Used to manage the overall game state and ensure proper role distribution.
 */
export type GameConfig = {
    /** The maximum number of creeps allowed in the game. */
    maxCreeps: number;

    /**
     * The minimum number of creeps required for each role.
     * Creeps will be spawned to meet these minimums before allocating new roles.
     */
    minCreepsPerRole: CreepRequisition;
};

/**
 * Default game configuration with maximum creeps and minimum creeps per role.
 * This configuration is used to initialize the game state and ensure that the game runs smoothly.
 *
 * @type {GameConfig}
 */
export const DEFAULT_GAME_CONFIG: GameConfig = {
    maxCreeps: 15,
    minCreepsPerRole: {
        harvester: 2,
        upgrader: 5,
        builder: 0
    }
};
