import { Board } from "../board/board.js";
import { BoardFactory } from "../board/board-factory.js";
import { FEN } from "../util/fen.js";
import { Game } from "./game.js";

export class GameFactory {

    private constructor() { }

    public static fromStartingPosition(): Game {
        const board: Board = BoardFactory.fromStartingPosition();
        const game: Game = new Game(board);
        return game;
    }

    public static fromFEN(fen: string): Game {
        const board: Board = BoardFactory.fromFEN(fen);
        const game: Game = new Game(board);
        FEN.parseGameStateFromFEN(game, fen);
        return game;
    }
}