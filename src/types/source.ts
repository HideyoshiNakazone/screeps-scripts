export const SourceSpotStatus = {
    INVALID: "-2",
    CENTER: "-1",
    UNKNOWN: "0",
    EMPTY: "1",
    OCCUPIED: "2",
} as const;


export type SourceSpotStatus = (typeof SourceSpotStatus)[keyof typeof SourceSpotStatus];


export type PositionDeltaValue = -1 | 0 | 1;

export type PositionDelta = {
    x: PositionDeltaValue;
    y: PositionDeltaValue;
}

export type SourcePositionMatrix = [
    SourceSpotStatus, SourceSpotStatus, SourceSpotStatus,
    SourceSpotStatus, SourceSpotStatus, SourceSpotStatus,
    SourceSpotStatus, SourceSpotStatus, SourceSpotStatus
]


export const createSourcePositionMatrix = () : SourcePositionMatrix => {
    return [
        SourceSpotStatus.UNKNOWN, SourceSpotStatus.UNKNOWN, SourceSpotStatus.UNKNOWN,
        SourceSpotStatus.UNKNOWN, SourceSpotStatus.CENTER, SourceSpotStatus.UNKNOWN,
        SourceSpotStatus.UNKNOWN, SourceSpotStatus.UNKNOWN, SourceSpotStatus.UNKNOWN
    ];
}


export const getNextEmptySpot = (matrix: SourcePositionMatrix): PositionDelta | null => {
    const index = matrix.findIndex( status => status === SourceSpotStatus.EMPTY);

    if (index === -1) {
        return null; // No empty spot found
    }

    return {
        x: (index % 3 - 1) as PositionDeltaValue, // Convert index to x delta (-1, 0, 1)
        y: (Math.floor(index / 3) - 1) as PositionDeltaValue // Convert index to y delta (-1, 0, 1)
    };
};


export const setSpotStatus = (matrix: SourcePositionMatrix, delta: PositionDelta, status: SourceSpotStatus): void => {
    const x = delta.x + 1; // Convert to index (0, 1, 2)
    const y = delta.y + 1; // Convert to index (0, 1, 2)

    if (x < 0 || x > 2 || y < 0 || y > 2) {
        throw new Error("Invalid position delta for source position matrix.");
    }

    const index = y * 3 + x; // Calculate the index in the flat array
    matrix[index] = status;
}


export const getPositionWithDelta = (pos: RoomPosition, delta: PositionDelta): RoomPosition => {
    return new RoomPosition(
        pos.x + delta.x,
        pos.y + delta.y,
        pos.roomName
    );
}

export const forEachMatrixSpot = (matrix: SourcePositionMatrix, callback: (delta: PositionDelta, status: SourceSpotStatus) => void): void => {
    for (let y = -1; y <= 1; y++) {
        for (let x = -1; x <= 1; x++) {
            const delta: PositionDelta = { x: x as PositionDeltaValue, y: y as PositionDeltaValue };
            const index = (y + 1) * 3 + (x + 1); // Convert delta to index
            callback(delta, matrix[index]);
        }
    }
};
