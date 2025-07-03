import { PieceFactory } from "../pieces/piece-factory";
import { Board } from "../board/board";
import { Color } from "../types/color";
import { PieceType } from "../types/piecetype";
import { Position } from "../types/position";

export class FEN {

    private constructor() { }

    public static fromFEN(fen: string): Board {
        // Parse FEN string, create pieces using PieceFactory, and return a Board instance
    }

    public static toFEN(board: Board): string {
        // Convert current board state to FEN string
    }
}