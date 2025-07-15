import CreepRunner from "CreepRunner";
import RequisitionsManager from "RequisitionsManager";
import RoomInspector from "RoomInspector";

class RoomRunner {
    public static run(room: Room, state: GameState): GameState {
        state = RoomInspector.inspectState(room, state);

        state = CreepRunner.run(room, state);

        return RequisitionsManager.validateState(room, state);
    }
}

export default RoomRunner;
