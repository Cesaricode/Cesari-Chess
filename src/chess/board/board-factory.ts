import { Piece } from "../pieces/piece.js";
import { Color } from "../types/color.js";
import { PieceState } from "../types/piece-state.js";
import { PieceType } from "../types/piece-type.js";
import { KingAndRookStartIndexes } from "../types/starting-indexes.js";
import { FEN } from "../util/fen.js";
import { createFischerRandomStartingPieces } from "../util/fischerandom-starting-pieces.js";
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

    public static fromFischerRandomStartingPosition(): Board {
        const board: Board = new Board();
        const pieces: Piece[] = createFischerRandomStartingPieces();
        board.populateGrid(pieces);
        return board;
    }

    public static fromFEN(fen: string): Board {
        if (!FEN.isValidFEN(fen)) throw new Error("Error creating board: Invalid FEN string");

        const board: Board = new Board();
        FEN.parseBoardFromFEN(board, fen);
        const fenParts = fen.split(" ");
        const castlingRights = fenParts[2] || "";

        const { kingX, rookQueensideX, rookKingsideX }: KingAndRookStartIndexes =
            FEN.getKingAndRookStartIndexesFromFEN(fen);

        for (const piece of board.getAllPieces()) {
            if (piece.type === PieceType.Pawn) {
                if ((piece.color === Color.White && piece.position.y !== 1) ||
                    (piece.color === Color.Black && piece.position.y !== 6)) {
                    const state: PieceState = piece.state;
                    state.hasMoved = true;
                    piece.setState(state);
                } else {
                    piece.state.hasMoved = false;
                }
            }
            if (piece.type === PieceType.King) {
                if (piece.color === Color.White) {
                    const state: PieceState = piece.state;
                    state.hasMoved = !(piece.position.x === kingX && piece.position.y === 0 && (castlingRights.includes("K") || castlingRights.includes("Q")));
                    piece.setState(state);
                } else {
                    const state: PieceState = piece.state;
                    state.hasMoved = !(piece.position.x === kingX && piece.position.y === 7 && (castlingRights.includes("k") || castlingRights.includes("q")));
                    piece.setState(state);
                }
            }
            if (piece.type === PieceType.Rook) {
                if (piece.color === Color.White) {
                    if (piece.position.x === rookQueensideX && piece.position.y === 0) {
                        const state: PieceState = piece.state;
                        state.hasMoved = !castlingRights.includes("Q");
                        piece.setState(state);
                    } else if (piece.position.x === rookKingsideX && piece.position.y === 0) {
                        const state: PieceState = piece.state;
                        state.hasMoved = !castlingRights.includes("K");
                        piece.setState(state);
                    } else {
                        const state: PieceState = piece.state;
                        state.hasMoved = true;
                        piece.setState(state);
                    }
                } else {
                    if (piece.position.x === rookQueensideX && piece.position.y === 7) {
                        const state: PieceState = piece.state;
                        state.hasMoved = !castlingRights.includes("q");
                        piece.setState(state);
                    } else if (piece.position.x === rookKingsideX && piece.position.y === 7) {
                        const state: PieceState = piece.state;
                        state.hasMoved = !castlingRights.includes("k");
                        piece.setState(state);
                    } else {
                        const state: PieceState = piece.state;
                        state.hasMoved = true;
                        piece.setState(state);
                    }
                }
            }
        }

        return board;
    }
}