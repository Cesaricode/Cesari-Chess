import { PieceType } from "./piece-type.js";

export type PromotionPieceType =
    | PieceType.Queen
    | PieceType.Rook
    | PieceType.Bishop
    | PieceType.Knight;