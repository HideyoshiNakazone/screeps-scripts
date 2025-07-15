import { checkPositionWalkable } from "utils/funcs/checkPosition";
import {
    createSourcePositionMatrix,
    forEachMatrixSpot,
    getPositionWithDelta,
    PositionSpotStatus,
    setSpotStatus
} from "utils/positions";

class RoomInspector {
    public static inspectState(room: Room, state: GameState): GameState {
        if (!this.stateWasInitialized(state)) {
            state = this.initializeState(room, state);
        }
        return state;
    }

    private static stateWasInitialized(state: GameState): boolean {
        return !!state.sourcesStates;
    }

    private static initializeState(room: Room, state: GameState): GameState {
        state.sourcesStates = {};
        state.maxHarvesters = 0;

        for (const source of room.find(FIND_SOURCES)) {
            this.configureSourceState(source, state);
        }

        return state;
    }

    private static configureSourceState(source: Source, state: GameState): void {
        const sourceId = source.id.toString();

        if (!state.sourcesStates[sourceId]) {
            state.sourcesStates[sourceId] = {
                id: sourceId,
                pos: source.pos,
                spots: createSourcePositionMatrix()
            };
        }

        forEachMatrixSpot(state.sourcesStates[sourceId].spots, (delta, status) => {
            if (status !== PositionSpotStatus.UNKNOWN) {
                return; // Skip known spots
            }
            const pos = getPositionWithDelta(source.pos, delta);
            if (checkPositionWalkable(pos)) {
                setSpotStatus(state.sourcesStates[sourceId].spots, delta, PositionSpotStatus.EMPTY);
                state.maxHarvesters += 1;
            } else {
                setSpotStatus(state.sourcesStates[sourceId].spots, delta, PositionSpotStatus.INVALID);
            }
        });
    }
}

export default RoomInspector;
