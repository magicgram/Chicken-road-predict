export interface User {
    id: string;
    predictionCount: number;
    awaitingDeposit: boolean;
    knownRedeposits: number;
    profilePictureUrl?: string;
}

export type GridCellState = 'hidden' | 'star' | 'bomb';