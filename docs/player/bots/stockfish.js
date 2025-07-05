var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { BotPlayer } from "../bot-player.js";
import { FEN } from "../../chess/util/fen.js";
export class StockfishBot extends BotPlayer {
    constructor(color) {
        super("Stockfish", color);
    }
    getMove(game) {
        return __awaiter(this, void 0, void 0, function* () {
            const fen = FEN.serializeFullFEN(game);
            const encodedFen = encodeURIComponent(fen);
            const url = `https://stockfish.online/api/s/v2.php?fen=${encodedFen}&depth=15`;
            const response = yield fetch(url, {
                method: "GET",
            });
            const data = yield response.json();
            if (!data.bestmove) {
                throw new Error("No best move returned from Stockfish API");
            }
            const match = data.bestmove.match(/^bestmove\s+([a-h][1-8][a-h][1-8][qrbn]?)/);
            if (!match) {
                throw new Error(`Could not parse best move from: ${data.bestmove}`);
            }
            const uci = match[1];
            return parseUciMoveToMoveObject(uci, game);
        });
    }
}
function parseUciMoveToMoveObject(uci, game) {
    const fromFile = uci[0];
    const fromRank = parseInt(uci[1], 10);
    const toFile = uci[2];
    const toRank = parseInt(uci[3], 10);
    const from = { x: fromFile.charCodeAt(0) - "a".charCodeAt(0), y: fromRank - 1 };
    const to = { x: toFile.charCodeAt(0) - "a".charCodeAt(0), y: toRank - 1 };
    const piece = game.board.getPieceAt(from);
    if (!piece)
        throw new Error(`No piece at ${uci.slice(0, 2)}`);
    const move = {
        from,
        to,
        piece: piece.type,
        color: piece.color
    };
    if (uci.length === 5) {
        const promoChar = uci[4].toLowerCase();
        let promotion;
        if (promoChar === "q")
            promotion = "queen";
        else if (promoChar === "r")
            promotion = "rook";
        else if (promoChar === "b")
            promotion = "bishop";
        else if (promoChar === "n")
            promotion = "knight";
        if (promotion)
            move.promotion = promotion;
    }
    return move;
}
