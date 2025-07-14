export const checkPositionWalkable = (pos: RoomPosition) => {
    // Check if the position is not obstructed by a wall
    const terrain = pos.lookFor(LOOK_TERRAIN);
    return terrain.length === 0 || terrain[0] !== 'wall'
}
