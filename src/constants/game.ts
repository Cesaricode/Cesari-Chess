import { PieceType } from "../types/piecetype";

export const FIFTY_MOVE_RULE_LIMIT: number = 50;
export const SEVENTYFIVE_MOVE_RULE_LIMIT: number = 75;

export const THREEFOLD_REPETITION_COUNT: number = 3;
export const FIVEFOLD_REPETITION_COUNT: number = 5;

export const PROMOTION_PIECES = [
    PieceType.Queen,
    PieceType.Rook,
    PieceType.Bishop,
    PieceType.Knight
] as const;