import { Color } from "./color.js";
import { CastlingRights } from "./castling-rights.js";
import { Position } from "./position.js";

export interface GameState {
    activeColor: Color;
    castlingRights: CastlingRights;
    enPassantTarget: Position | null;
    halfmoveClock: number;
    fullmoveNumber: number;
}