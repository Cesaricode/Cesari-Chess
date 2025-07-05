import { Game } from "../chess/game/game.js";
import { Move } from "../chess/types/move.js";
import { FEN } from "../chess/util/fen.js";
import { parseUciMoveToMoveObject } from "../chess/util/uci.js";
import { StockfishApiResponse } from "./stockfish-interface.js";

export class StockfishService {
    static apiUrl: string = "https://stockfish.online/api/s/v2.php";

    private constructor() { }

    static async getBestMove(game: Game, depth: number = 15): Promise<Move> {
        const fen: string = FEN.serializeFullFEN(game);
        const encodedFen: string = encodeURIComponent(fen);
        const url: string = `${this.apiUrl}?fen=${encodedFen}&depth=${depth}`;

        const response: Response = await fetch(url, { method: "GET" });
        const data: StockfishApiResponse = await response.json();

        if (!data.bestmove) {
            throw new Error("No best move returned from Stockfish API");
        }

        const match: RegExpMatchArray | null = data.bestmove.match(/^bestmove\s+([a-h][1-8][a-h][1-8][qrbn]?)/);
        if (!match) {
            throw new Error(`Could not parse best move from: ${data.bestmove}`);
        }
        const uci = match[1];

        return parseUciMoveToMoveObject(uci, game);
    }
}