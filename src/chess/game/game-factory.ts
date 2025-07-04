import { Board } from "../board/board";
import { BoardFactory } from "../board/board-factory";
import { FEN } from "../util/fen";
import { Game } from "./game";

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