import { Color } from "./color";
import { CastlingRights } from "./castling-rights";
import { Position } from "./position";

export interface GameState {
    activeColor: Color;
    castlingRights: CastlingRights;
    enPassantTarget: Position | null;
    halfmoveClock: number;
    fullmoveNumber: number;
}