export const SourceSpotStatus = {
    INVALID: "-2",
    CENTER: "-1",
    UNKNOWN: "0",
    EMPTY: "1",
    OCCUPIED: "2",
} as const;


export type SourceSpotStatus = (typeof SourceSpotStatus)[keyof typeof SourceSpotStatus];


export type PositionDeltaValue = -1 | 0 | 1;

export type PositionDelta = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export type SourcePositionMatrix = {
    locked: boolean;
    data: [
        SourceSpotStatus, SourceSpotStatus, SourceSpotStatus,
        SourceSpotStatus, SourceSpotStatus, SourceSpotStatus,
        SourceSpotStatus, SourceSpotStatus, SourceSpotStatus
    ];
}


type MatrixPoint = {
    x: PositionDeltaValue;
    y: PositionDeltaValue;
}


const indexToMatrixPoint = (index: number): MatrixPoint => {
    // where the 0,0 point is the center of the matrix and -1, -1 is the top-left corner
    const x = ((index % 3) - 1) as PositionDeltaValue; // Convert index to x coordinate (-1, 0, 1)
    const y = (Math.floor(index / 3) - 1) as PositionDeltaValue; // Convert index to y coordinate (-1, 0, 1)
    return { x, y };
}

export const createSourcePositionMatrix = () : SourcePositionMatrix => {
    return {
        locked: false,
        data: [
            SourceSpotStatus.UNKNOWN, SourceSpotStatus.UNKNOWN, SourceSpotStatus.UNKNOWN,
            SourceSpotStatus.UNKNOWN, SourceSpotStatus.CENTER, SourceSpotStatus.UNKNOWN,
            SourceSpotStatus.UNKNOWN, SourceSpotStatus.UNKNOWN, SourceSpotStatus.UNKNOWN
        ]
    };
}


export const getNextEmptySpot = (matrix: SourcePositionMatrix): PositionDelta | null => {
    const index = matrix.data.findIndex( status => status === SourceSpotStatus.EMPTY);

    if (index === -1) {
        return null; // No empty spot found
    }

    return index as PositionDelta; // Convert index to PositionDelta
};


export const setSpotStatus = (matrix: SourcePositionMatrix, delta: PositionDelta, status: SourceSpotStatus): void => {
    matrix.data[delta as number] = status;
}


export const getPositionWithDelta = (pos: RoomPosition, delta: PositionDelta): RoomPosition => {
    const matrixPoint = indexToMatrixPoint(delta as number);
    return new RoomPosition(
        pos.x + matrixPoint.x,
        pos.y + matrixPoint.y,
        pos.roomName
    );
}

export const forEachMatrixSpot = (matrix: SourcePositionMatrix, callback: (delta: PositionDelta, status: SourceSpotStatus) => void): void => {
    for (const index in matrix.data) {
        callback(index as PositionDelta, matrix.data[index]);
    }
};
