import { BoardFactory } from "../board/board-factory.js";
import { FEN } from "../util/fen.js";
import { Game } from "./game.js";
export class GameFactory {
    constructor() { }
    static fromStartingPosition() {
        const board = BoardFactory.fromStartingPosition();
        const game = new Game(board);
        return game;
    }
    static fromFEN(fen) {
        if (!FEN.isValidFEN(fen))
            throw new Error("Error creating game: Invalid FEN string");
        const board = BoardFactory.fromFEN(fen);
        const game = new Game(board, undefined, fen);
        FEN.parseGameStateFromFEN(game, fen);
        return game;
    }
}
