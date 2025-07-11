import { BoardFactory } from "../board/board-factory.js";
import { FEN } from "../util/fen.js";
import { Game } from "./game.js";
import { Variant } from "../../types/variant.js";
import { STARTING_FEN } from "../constants/fen.js";
export class GameFactory {
    constructor() { }
    static fromStartingPosition(moveValidator, variant) {
        let board;
        let startingFEN;
        if (variant === Variant.Fischerandom) {
            board = BoardFactory.fromFischerRandomStartingPosition();
            startingFEN = FEN.serializeBoardAndStartingStateToFEN(board);
        }
        else {
            board = BoardFactory.fromStartingPosition();
            startingFEN = STARTING_FEN;
        }
        return new Game(moveValidator, variant, board, startingFEN);
    }
    static fromFEN(fen, moveValidator, variant) {
        if (!FEN.isValidFEN(fen))
            throw new Error("Error creating game: Invalid FEN string");
        const board = BoardFactory.fromFEN(fen);
        const game = new Game(moveValidator, variant, board, fen);
        FEN.parseGameStateFromFEN(game, fen);
        return game;
    }
}
