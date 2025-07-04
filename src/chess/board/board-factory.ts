import { Piece } from "../pieces/piece.js";
import { FEN } from "../util/fen.js";
import { createStartingPieces } from "../util/starting-pieces.js";
import { Board } from "./board.js";

export class BoardFactory {

    private constructor() { }

    public static fromStartingPosition(): Board {
        const board: Board = new Board();
        const pieces: Piece[] = createStartingPieces();
        board.populateGrid(pieces);
        return board;
    }

    public static fromFEN(fen: string): Board {
        const board: Board = new Board();
        FEN.parseBoardFromFEN(board, fen);
        return board;
    }
}