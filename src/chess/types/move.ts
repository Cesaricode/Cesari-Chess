import { Position } from "./position";
import { PieceType } from "./piece-type";
import { Color } from "./color";
import { PromotionPieceType } from "./promotion-piece-type";

export interface Move {
    from: Position;
    to: Position;
    piece: PieceType;
    color: Color;
    capturedPiece?: PieceType;
    promotion?: PromotionPieceType;
}