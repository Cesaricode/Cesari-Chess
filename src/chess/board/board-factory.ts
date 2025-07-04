import { Piece } from "../pieces/piece";
import { FEN } from "../util/fen";
import { createStartingPieces } from "../util/starting-pieces";
import { Board } from "./board";

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