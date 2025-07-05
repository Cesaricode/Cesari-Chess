import { FEN_PIECE_SYMBOLS } from "../constants/fen.js";
import { BOARD_WIDTH, BOARD_HEIGHT } from "../constants/board.js";
import { PieceFactory } from "../pieces/piece-factory.js";
import { Color } from "../types/color.js";
import { Board } from "../board/board.js";
import { Game } from "../game/game.js";
export class FEN {
    constructor() { }
    static serializeFullFEN(game) {
        var _a, _b;
        const boardPart = this.serializeBoardToFEN(game.board);
        const activeColor = game.activeColor === Color.White ? "w" : "b";
        const castling = this.castlingObjectToString(game.castlingRights);
        const enPassant = game.enPassantTarget ? this.positionToString(game.enPassantTarget) : "-";
        const halfmove = (_a = game.halfmoveClock) !== null && _a !== void 0 ? _a : 0;
        const fullmove = (_b = game.fullmoveNumber) !== null && _b !== void 0 ? _b : 1;
        return [boardPart, activeColor, castling, enPassant, halfmove, fullmove].join(" ");
    }
    static parseFullFEN(game, fen) {
        const [boardPart, activeColor, castling, enPassant, halfmove, fullmove] = fen.split(" ");
        this.parseBoardFromFEN(game.board, boardPart);
        game.activeColor = activeColor === "w" ? Color.White : Color.Black;
        game.castlingRights = this.castlingStringToObject(castling);
        game.enPassantTarget = enPassant !== "-" ? this.parsePosition(enPassant) : null;
        game.halfmoveClock = parseInt(halfmove, 10);
        game.fullmoveNumber = parseInt(fullmove, 10);
    }
    static gameFromFEN(fen) {
        const [boardPart, activeColor, castling, enPassant, halfmove, fullmove] = fen.split(" ");
        const board = new Board();
        this.parseBoardFromFEN(board, boardPart);
        const game = new Game(board);
        game.activeColor = activeColor === "w" ? Color.White : Color.Black;
        game.castlingRights = this.castlingStringToObject(castling);
        game.enPassantTarget = enPassant !== "-" ? this.parsePosition(enPassant) : null;
        game.halfmoveClock = parseInt(halfmove, 10);
        game.fullmoveNumber = parseInt(fullmove, 10);
        return game;
    }
    static parseBoardFromFEN(board, placement) {
        var _a, _b;
        const pieces = [];
        const rows = placement.split("/");
        for (let y = 0; y < BOARD_HEIGHT; y++) {
            let x = 0;
            for (const char of rows[y]) {
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
                    if (type) {
                        pieces.push(PieceFactory.create(type, color, { x, y }));
                    }
                    x++;
                }
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
        game.castlingRights = this.castlingStringToObject(castling);
        game.enPassantTarget = enPassant !== "-" ? FEN.parsePosition(enPassant) : null;
        game.halfmoveClock = parseInt(halfmove, 10);
        game.fullmoveNumber = parseInt(fullmove, 10);
    }
    static serializeGameStateToFEN(game) {
        var _a, _b;
        const activeColor = game.activeColor === Color.White ? "w" : "b";
        const castling = this.castlingObjectToString(game.castlingRights);
        const enPassant = game.enPassantTarget ? FEN.positionToString(game.enPassantTarget) : "-";
        const halfmove = (_a = game.halfmoveClock) !== null && _a !== void 0 ? _a : 0;
        const fullmove = (_b = game.fullmoveNumber) !== null && _b !== void 0 ? _b : 1;
        return [activeColor, castling, enPassant, halfmove, fullmove].join(" ");
    }
    static parsePosition(pos) {
        const file = pos.charCodeAt(0) - "a".charCodeAt(0);
        const rank = BOARD_HEIGHT - parseInt(pos[1], 10);
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
