import { FEN_PIECE_SYMBOLS } from "../constants/fen.js";
import { BOARD_WIDTH, BOARD_HEIGHT } from "../constants/board.js";
import { Piece } from "../pieces/piece.js";
import { PieceFactory } from "../pieces/piece-factory.js";
import { Color } from "../types/color.js";
import { PieceType } from "../types/piece-type.js";
import { Position } from "../types/position.js";
import { Board } from "../board/board.js";
import { CastlingRights } from "../types/castling-rights.js";
import { GameState } from "../types/game-state.js";
import { Game } from "../game/game.js";

export class FEN {

    private constructor() { }

    public static isValidFEN(fen: string): boolean {
        if (!fen || typeof fen !== "string") return false;
        const parts: string[] = fen.trim().split(/\s+/);
        if (parts.length !== 6) return false;

        const [board, activeColor, castling, enPassant, halfmove, fullmove]: string[] = parts;
        const rows: string[] = board.split("/");
        if (rows.length !== 8) return false;

        for (const row of rows) {
            let count: number = 0;
            for (const char of row) {
                if (/[1-8]/.test(char)) {
                    count += parseInt(char, 10);
                } else if ("rnbqkpRNBQKP".includes(char)) {
                    count += 1;
                } else {
                    return false;
                }
            }
            if (count !== 8) return false;
        }

        if (activeColor !== "w" && activeColor !== "b") return false;
        if (!/^(-|[KQkq]{1,4})$/.test(castling)) return false;
        if (enPassant !== "-" && !/^[a-h][36]$/.test(enPassant)) return false;
        if (isNaN(Number(halfmove)) || isNaN(Number(fullmove))) return false;
        if (parseInt(halfmove, 10) < 0 || parseInt(fullmove, 10) <= 0) return false;

        return true;
    }

    public static serializeFullFEN(game: Game): string {
        const boardPart: string = FEN.serializeBoardToFEN(game.board);
        const activeColor: string = game.activeColor === Color.White ? "w" : "b";
        const castling: string = FEN.castlingObjectToString(game.castlingRights);
        const enPassant: string = game.enPassantTarget ? FEN.positionToString(game.enPassantTarget) : "-";
        const halfmove: number = game.halfmoveClock ?? 0;
        const fullmove: number = game.fullmoveNumber ?? 1;
        return [boardPart, activeColor, castling, enPassant, halfmove, fullmove].join(" ");
    }

    public static parseFullFEN(game: Game, fen: string): void {
        const [boardPart, activeColor, castling, enPassant, halfmove, fullmove]: string[] = fen.split(" ");
        FEN.parseBoardFromFEN(game.board, boardPart);
        game.activeColor = activeColor === "w" ? Color.White : Color.Black;
        game.castlingRights = FEN.castlingStringToObject(castling);
        game.enPassantTarget = enPassant !== "-" ? FEN.parsePosition(enPassant) : null;
        game.halfmoveClock = parseInt(halfmove, 10);
        game.fullmoveNumber = parseInt(fullmove, 10);
    }

    public static gameFromFEN(fen: string): Game {
        const [boardPart, activeColor, castling, enPassant, halfmove, fullmove]: string[] = fen.split(" ");
        const board: Board = new Board();
        FEN.parseBoardFromFEN(board, boardPart);
        const game: Game = new Game(board);
        game.activeColor = activeColor === "w" ? Color.White : Color.Black;
        game.castlingRights = FEN.castlingStringToObject(castling);
        game.enPassantTarget = enPassant !== "-" ? FEN.parsePosition(enPassant) : null;
        game.halfmoveClock = parseInt(halfmove, 10);
        game.fullmoveNumber = parseInt(fullmove, 10);
        return game;
    }

    public static parseBoardFromFEN(board: Board, fen: string): void {
        const [placement]: string[] = fen.split(" ");
        const pieces: Piece[] = [];
        const rows: string[] = placement.split("/");
        for (let y = 0; y < BOARD_HEIGHT; y++) {
            let x: number = 0;
            const fenRow: string = rows[y];
            const boardY: number = BOARD_HEIGHT - 1 - y;
            for (const char of fenRow) {
                if (/\d/.test(char)) {
                    x += parseInt(char, 10);
                } else {
                    let color: Color;
                    let type: PieceType | undefined;
                    if (char === char.toUpperCase()) {
                        color = Color.White;
                        type = Object.entries(FEN_PIECE_SYMBOLS.white).find(([, v]) => v === char)?.[0] as PieceType;
                    } else {
                        color = Color.Black;
                        type = Object.entries(FEN_PIECE_SYMBOLS.black).find(([, v]) => v === char)?.[0] as PieceType;
                    }
                    if (type && x < BOARD_WIDTH) {
                        pieces.push(PieceFactory.create(type, color, { x, y: boardY }));
                    }
                    x++;
                }
                if (x > BOARD_WIDTH) {
                    throw new Error(`FEN row ${y} overflows board width: ${placement}`);
                }
            }
            if (x !== BOARD_WIDTH) {
                throw new Error(`FEN row ${y} does not fill board: ${placement}`);
            }
        }
        board.populateGrid(pieces);
    }

    public static serializeBoardToFEN(board: Board): string {
        let fen: string = "";
        for (let y = BOARD_HEIGHT - 1; y >= 0; y--) {
            let empty: number = 0;
            for (let x = 0; x < BOARD_WIDTH; x++) {
                const piece: Piece | null = board.getPieceAt({ x, y });
                if (!piece) {
                    empty++;
                } else {
                    if (empty > 0) {
                        fen += empty;
                        empty = 0;
                    }
                    const color: Color = piece.color;
                    const type: PieceType = piece.type;
                    let symbol: string | undefined;
                    if (color === Color.White) {
                        symbol = Object.entries(FEN_PIECE_SYMBOLS.white).find(([k]) => k === type.toLowerCase())?.[1];
                    } else {
                        symbol = Object.entries(FEN_PIECE_SYMBOLS.black).find(([k]) => k === type.toLowerCase())?.[1];
                    }
                    fen += symbol ?? "?";
                }
            }
            if (empty > 0) fen += empty;
            if (y > 0) fen += "/";
        }
        return fen;
    }

    public static parseGameStateFromFEN(game: GameState, fen: string): void {
        const [, activeColor, castling, enPassant, halfmove, fullmove]: string[] = fen.split(" ");
        game.activeColor = activeColor === "w" ? Color.White : Color.Black;
        game.castlingRights = FEN.castlingStringToObject(castling);
        game.enPassantTarget = enPassant !== "-" ? FEN.parsePosition(enPassant) : null;
        game.halfmoveClock = parseInt(halfmove, 10);
        game.fullmoveNumber = parseInt(fullmove, 10);
    }

    public static serializeGameStateToFEN(game: GameState): string {
        const activeColor: string = game.activeColor === Color.White ? "w" : "b";
        const castling: string = FEN.castlingObjectToString(game.castlingRights);
        const enPassant: string = game.enPassantTarget ? FEN.positionToString(game.enPassantTarget) : "-";
        const halfmove: number = game.halfmoveClock ?? 0;
        const fullmove: number = game.fullmoveNumber ?? 1;
        return [activeColor, castling, enPassant, halfmove, fullmove].join(" ");
    }

    private static parsePosition(pos: string): Position {
        const file: number = pos.charCodeAt(0) - "a".charCodeAt(0);
        const rank: number = parseInt(pos[1], 10) - 1;
        return { x: file, y: rank };
    }

    private static positionToString(pos: Position): string {
        const file: string = String.fromCharCode("a".charCodeAt(0) + pos.x);
        const rank: string = (BOARD_HEIGHT - pos.y).toString();
        return file + rank;
    }

    private static castlingObjectToString(castlingRights: CastlingRights): string {
        let result = "";
        if (castlingRights.whiteKingSide) result += "K";
        if (castlingRights.whiteQueenSide) result += "Q";
        if (castlingRights.blackKingSide) result += "k";
        if (castlingRights.blackQueenSide) result += "q";
        return result || "-";
    }

    private static castlingStringToObject(castling: string): CastlingRights {
        return {
            whiteKingSide: castling.includes("K"),
            whiteQueenSide: castling.includes("Q"),
            blackKingSide: castling.includes("k"),
            blackQueenSide: castling.includes("q"),
        };
    }

    public static getRepetitionFEN(game: Game): string {
        const boardPart: string = FEN.serializeBoardToFEN(game.board);
        const activeColor: "b" | "w" = game.activeColor === Color.White ? "w" : "b";
        const castling: string = FEN.castlingObjectToString(game.castlingRights);
        const enPassant: string = game.enPassantTarget ? FEN.positionToString(game.enPassantTarget) : "-";
        return [boardPart, activeColor, castling, enPassant].join(" ");
    }
}