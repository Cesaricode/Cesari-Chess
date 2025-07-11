import { Board } from "../board/board.js";
import { BoardFactory } from "../board/board-factory.js";
import { FEN } from "../util/fen.js";
import { Game } from "./game.js";
import { MoveValidator } from "../rules/move-validator-interface.js";
import { Variant } from "../../types/variant.js";
import { STARTING_FEN } from "../constants/fen.js";

export class GameFactory {

    private constructor() { }

    public static fromStartingPosition(moveValidator: MoveValidator, variant: Variant): Game {
        let board: Board;
        let startingFEN: string;

        if (variant === Variant.Fischerandom) {
            board = BoardFactory.fromFischerRandomStartingPosition();
            startingFEN = FEN.serializeBoardAndStartingStateToFEN(board);
        } else {
            board = BoardFactory.fromStartingPosition();
            startingFEN = STARTING_FEN;
        }

        return new Game(moveValidator, variant, board, startingFEN);
    }


    public static fromFEN(fen: string, moveValidator: MoveValidator, variant: Variant): Game {
        if (!FEN.isValidFEN(fen)) throw new Error("Error creating game: Invalid FEN string");
        const board: Board = BoardFactory.fromFEN(fen);
        const game: Game = new Game(moveValidator, variant, board, fen);
        FEN.parseGameStateFromFEN(game, fen);
        return game;
    }
}