import { PieceType } from "./piece-type";

export type PromotionPieceType =
    | PieceType.Queen
    | PieceType.Rook
    | PieceType.Bishop
    | PieceType.Knight;