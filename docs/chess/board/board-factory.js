import { FEN } from "../util/fen.js";
import { createStartingPieces } from "../util/starting-pieces.js";
import { Board } from "./board.js";
export class BoardFactory {
    constructor() { }
    static fromStartingPosition() {
        const board = new Board();
        const pieces = createStartingPieces();
        board.populateGrid(pieces);
        return board;
    }
    static fromFEN(fen) {
        const board = new Board();
        FEN.parseBoardFromFEN(board, fen);
        return board;
    }
}
