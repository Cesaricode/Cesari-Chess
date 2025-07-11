import { Position } from "./position.js";
import { PieceType } from "./piece-type.js";
import { Color } from "./color.js";
import { PromotionPieceType } from "./promotion-piece-type.js";

export interface Move {
    from: Position;
    to: Position;
    piece: PieceType;
    color: Color;
    castling: boolean;
    capturedPiece?: PieceType;
    promotion?: PromotionPieceType;
}