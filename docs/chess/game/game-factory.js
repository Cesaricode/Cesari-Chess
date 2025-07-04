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
        const board = BoardFactory.fromFEN(fen);
        const game = new Game(board);
        FEN.parseGameStateFromFEN(game, fen);
        return game;
    }
}
