import { PositionDelta, PositionDeltaValue, PositionMatrix, PositionSpotStatus } from "./position.types";

/**
 * Represents a point in the matrix with x and y coordinates.
 */
type MatrixPoint = {
    x: PositionDeltaValue;
    y: PositionDeltaValue;
};

/**
 * Converts a matrix index to a matrix point.
 */
const indexToMatrixPoint = (index: number): MatrixPoint => {
    // where the 0,0 point is the center of the matrix and -1, -1 is the top-left corner
    const x = ((index % 3) - 1) as PositionDeltaValue; // Convert index to x coordinate (-1, 0, 1)
    const y = (Math.floor(index / 3) - 1) as PositionDeltaValue; // Convert index to y coordinate (-1, 0, 1)
    return { x, y };
};

/**
 * Creates a source position matrix with a default value.
 * The center of the matrix is always `PositionSpotStatus.CENTER`.
 * The default value is used for all other spots.
 */
export const createSourcePositionMatrix = (default_value?: PositionSpotStatus): PositionMatrix => {
    const center_value = PositionSpotStatus.CENTER;

    default_value = default_value || PositionSpotStatus.UNKNOWN;

    return [
        default_value,
        default_value,
        default_value,
        default_value,
        center_value,
        default_value,
        default_value,
        default_value,
        default_value
    ];
};

/**
 * Gets the next empty spot in the matrix.
 */
export const getNextEmptySpot = (matrix: PositionMatrix): PositionDelta | null => {
    const index = matrix.findIndex(status => status === PositionSpotStatus.EMPTY);

    if (index === -1) {
        return null; // No empty spot found
    }

    return index as PositionDelta; // Convert index to PositionDelta
};

/**
 * Sets the status of a spot in the matrix.
 * Throws an error if the delta is out of bounds.
 */
export const setSpotStatus = (matrix: PositionMatrix, delta: PositionDelta, status: PositionSpotStatus): void => {
    if (delta < 0 || delta >= matrix.length) {
        throw new Error(`Invalid delta: ${delta}. Must be between 0 and ${matrix.length - 1}.`);
    }
    matrix[delta] = status;
};

/**
 * Gets the position with a delta applied to the given RoomPosition.
 */
export const getPositionWithDelta = (pos: RoomPosition, delta: PositionDelta): RoomPosition => {
    const matrixPoint = indexToMatrixPoint(delta as number);
    return new RoomPosition(pos.x + matrixPoint.x, pos.y + matrixPoint.y, pos.roomName);
};

/**
 * Iterates over each spot in the matrix and applies the callback function.
 * The callback receives the delta (index) and the status of the spot.
 */
export const forEachMatrixSpot = (
    matrix: PositionMatrix,
    callback: (delta: PositionDelta, status: PositionSpotStatus) => void
): void => {
    for (const index in matrix) {
        const positionIndex = Number(index);
        callback(positionIndex as PositionDelta, matrix[positionIndex]);
    }
};
