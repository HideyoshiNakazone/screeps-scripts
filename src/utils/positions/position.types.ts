/**
 * Represents the status of a position spot
 */
export const PositionSpotStatus = {
    INVALID: "-2",
    CENTER: "-1",
    UNKNOWN: "0",
    EMPTY: "1",
    OCCUPIED: "2"
} as const;

export type PositionSpotStatus = (typeof PositionSpotStatus)[keyof typeof PositionSpotStatus];

/**
 * Represents dislocation to be applied a axis to a position relative to a source or a point of interest.
 */
export type PositionDeltaValue = -1 | 0 | 1;

/**
 * Represents a matrix of positions around a source or a point of interest.
 * The matrix is a 3x3 grid where the center is the point of interest.
 * The center should always be `PositionSpotStatus.CENTER`.
 */
export type PositionMatrix = [
    PositionSpotStatus,
    PositionSpotStatus,
    PositionSpotStatus,
    PositionSpotStatus,
    PositionSpotStatus,
    PositionSpotStatus,
    PositionSpotStatus,
    PositionSpotStatus,
    PositionSpotStatus
];

// Valid indices for the 3x3 matrix (0-8)
export type PositionDelta = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
