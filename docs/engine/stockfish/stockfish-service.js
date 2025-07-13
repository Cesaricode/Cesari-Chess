var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { FEN } from "../../chess/util/fen.js";
import { parseUciMoveToMoveObject } from "../../chess/util/uci.js";
export class StockfishService {
    constructor() { }
    static getBestMove(game_1) {
        return __awaiter(this, arguments, void 0, function* (game, depth = 15) {
            const fen = FEN.serializeFullFEN(game);
            const encodedFen = encodeURIComponent(fen);
            const url = `${this.apiUrl}?fen=${encodedFen}&depth=${depth}`;
            const response = yield fetch(url, { method: "GET" });
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
StockfishService.apiUrl = "https://stockfish.online/api/s/v2.php";
