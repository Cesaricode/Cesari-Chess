import { FEN_PIECE_SYMBOLS } from "../constants/fen.js";
import { BOARD_WIDTH, BOARD_HEIGHT } from "../constants/board.js";
import { PieceFactory } from "../pieces/piece-factory.js";
import { Color } from "../types/color.js";
import { Board } from "../board/board.js";
import { Game } from "../game/game.js";
export class FEN {
    constructor() { }
    static isValidFEN(fen) {
        if (!fen || typeof fen !== "string")
            return false;
        const parts = fen.trim().split(/\s+/);
        if (parts.length !== 6)
            return false;
        const [board, activeColor, castling, enPassant, halfmove, fullmove] = parts;
        const rows = board.split("/");
        if (rows.length !== 8)
            return false;
        for (const row of rows) {
            let count = 0;
            for (const char of row) {
                if (/[1-8]/.test(char)) {
                    count += parseInt(char, 10);
                }
                else if ("rnbqkpRNBQKP".includes(char)) {
                    count += 1;
                }
                else {
                    return false;
                }
            }
            if (count !== 8)
                return false;
        }
        if (activeColor !== "w" && activeColor !== "b")
            return false;
        if (!/^(-|[KQkq]{1,4})$/.test(castling))
            return false;
        if (enPassant !== "-" && !/^[a-h][36]$/.test(enPassant))
            return false;
        if (isNaN(Number(halfmove)) || isNaN(Number(fullmove)))
            return false;
        if (parseInt(halfmove, 10) < 0 || parseInt(fullmove, 10) <= 0)
            return false;
        return true;
    }
    static serializeFullFEN(game) {
        var _a, _b;
        const boardPart = FEN.serializeBoardToFEN(game.board);
        const activeColor = game.activeColor === Color.White ? "w" : "b";
        const castling = FEN.castlingObjectToString(game.castlingRights);
        const enPassant = game.enPassantTarget ? FEN.positionToString(game.enPassantTarget) : "-";
        const halfmove = (_a = game.halfmoveClock) !== null && _a !== void 0 ? _a : 0;
        const fullmove = (_b = game.fullmoveNumber) !== null && _b !== void 0 ? _b : 1;
        return [boardPart, activeColor, castling, enPassant, halfmove, fullmove].join(" ");
    }
    static parseFullFEN(game, fen) {
        const [boardPart, activeColor, castling, enPassant, halfmove, fullmove] = fen.split(" ");
        FEN.parseBoardFromFEN(game.board, boardPart);
        game.activeColor = activeColor === "w" ? Color.White : Color.Black;
        game.castlingRights = FEN.castlingStringToObject(castling);
        game.enPassantTarget = enPassant !== "-" ? FEN.parsePosition(enPassant) : null;
        game.halfmoveClock = parseInt(halfmove, 10);
        game.fullmoveNumber = parseInt(fullmove, 10);
    }
    static gameFromFEN(fen) {
        const [boardPart, activeColor, castling, enPassant, halfmove, fullmove] = fen.split(" ");
        const board = new Board();
        FEN.parseBoardFromFEN(board, boardPart);
        const game = new Game(board);
        game.activeColor = activeColor === "w" ? Color.White : Color.Black;
        game.castlingRights = FEN.castlingStringToObject(castling);
        game.enPassantTarget = enPassant !== "-" ? FEN.parsePosition(enPassant) : null;
        game.halfmoveClock = parseInt(halfmove, 10);
        game.fullmoveNumber = parseInt(fullmove, 10);
        return game;
    }
    static parseBoardFromFEN(board, fen) {
        var _a, _b;
        const [placement] = fen.split(" ");
        const pieces = [];
        const rows = placement.split("/");
        for (let y = 0; y < BOARD_HEIGHT; y++) {
            let x = 0;
            const fenRow = rows[y];
            const boardY = BOARD_HEIGHT - 1 - y;
            for (const char of fenRow) {
                if (/\d/.test(char)) {
                    x += parseInt(char, 10);
                }
                else {
                    let color;
                    let type;
                    if (char === char.toUpperCase()) {
                        color = Color.White;
                        type = (_a = Object.entries(FEN_PIECE_SYMBOLS.white).find(([, v]) => v === char)) === null || _a === void 0 ? void 0 : _a[0];
                    }
                    else {
                        color = Color.Black;
                        type = (_b = Object.entries(FEN_PIECE_SYMBOLS.black).find(([, v]) => v === char)) === null || _b === void 0 ? void 0 : _b[0];
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
    static serializeBoardToFEN(board) {
        var _a, _b;
        let fen = "";
        for (let y = BOARD_HEIGHT - 1; y >= 0; y--) {
            let empty = 0;
            for (let x = 0; x < BOARD_WIDTH; x++) {
                const piece = board.getPieceAt({ x, y });
                if (!piece) {
                    empty++;
                }
                else {
                    if (empty > 0) {
                        fen += empty;
                        empty = 0;
                    }
                    const color = piece.color;
                    const type = piece.type;
                    let symbol;
                    if (color === Color.White) {
                        symbol = (_a = Object.entries(FEN_PIECE_SYMBOLS.white).find(([k]) => k === type.toLowerCase())) === null || _a === void 0 ? void 0 : _a[1];
                    }
                    else {
                        symbol = (_b = Object.entries(FEN_PIECE_SYMBOLS.black).find(([k]) => k === type.toLowerCase())) === null || _b === void 0 ? void 0 : _b[1];
                    }
                    fen += symbol !== null && symbol !== void 0 ? symbol : "?";
                }
            }
            if (empty > 0)
                fen += empty;
            if (y > 0)
                fen += "/";
        }
        return fen;
    }
    static parseGameStateFromFEN(game, fen) {
        const [, activeColor, castling, enPassant, halfmove, fullmove] = fen.split(" ");
        game.activeColor = activeColor === "w" ? Color.White : Color.Black;
        game.castlingRights = FEN.castlingStringToObject(castling);
        game.enPassantTarget = enPassant !== "-" ? FEN.parsePosition(enPassant) : null;
        game.halfmoveClock = parseInt(halfmove, 10);
        game.fullmoveNumber = parseInt(fullmove, 10);
    }
    static serializeGameStateToFEN(game) {
        var _a, _b;
        const activeColor = game.activeColor === Color.White ? "w" : "b";
        const castling = FEN.castlingObjectToString(game.castlingRights);
        const enPassant = game.enPassantTarget ? FEN.positionToString(game.enPassantTarget) : "-";
        const halfmove = (_a = game.halfmoveClock) !== null && _a !== void 0 ? _a : 0;
        const fullmove = (_b = game.fullmoveNumber) !== null && _b !== void 0 ? _b : 1;
        return [activeColor, castling, enPassant, halfmove, fullmove].join(" ");
    }
    static parsePosition(pos) {
        const file = pos.charCodeAt(0) - "a".charCodeAt(0);
        const rank = parseInt(pos[1], 10) - 1;
        return { x: file, y: rank };
    }
    static positionToString(pos) {
        const file = String.fromCharCode("a".charCodeAt(0) + pos.x);
        const rank = (BOARD_HEIGHT - pos.y).toString();
        return file + rank;
    }
    static castlingObjectToString(castlingRights) {
        let result = "";
        if (castlingRights.whiteKingSide)
            result += "K";
        if (castlingRights.whiteQueenSide)
            result += "Q";
        if (castlingRights.blackKingSide)
            result += "k";
        if (castlingRights.blackQueenSide)
            result += "q";
        return result || "-";
    }
    static castlingStringToObject(castling) {
        return {
            whiteKingSide: castling.includes("K"),
            whiteQueenSide: castling.includes("Q"),
            blackKingSide: castling.includes("k"),
            blackQueenSide: castling.includes("q"),
        };
    }
    static getRepetitionFEN(game) {
        const boardPart = FEN.serializeBoardToFEN(game.board);
        const activeColor = game.activeColor === Color.White ? "w" : "b";
        const castling = FEN.castlingObjectToString(game.castlingRights);
        const enPassant = game.enPassantTarget ? FEN.positionToString(game.enPassantTarget) : "-";
        return [boardPart, activeColor, castling, enPassant].join(" ");
    }
}
