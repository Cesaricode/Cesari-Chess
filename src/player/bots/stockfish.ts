import { BotPlayer } from "../bot-player.js";
import { Game } from "../../chess/game/game.js";
import { Move } from "../../chess/types/move.js";
import { Color } from "../../chess/types/color.js";
import { FEN } from "../../chess/util/fen.js";

export class StockfishBot extends BotPlayer {
    constructor(color: Color) {
        super("Stockfish", color);
    }

    async getMove(game: Game): Promise<Move> {
        const fen: string = FEN.serializeFullFEN(game);
        const encodedFen = encodeURIComponent(fen);
        const url = `https://stockfish.online/api/s/v2.php?fen=${encodedFen}&depth=15`;

        const response = await fetch(url, {
            method: "GET",
        });

        const data = await response.json();

        if (!data.bestmove) {
            throw new Error("No best move returned from Stockfish API");
        }

        const match = data.bestmove.match(/^bestmove\s+([a-h][1-8][a-h][1-8][qrbn]?)/);
        if (!match) {
            throw new Error(`Could not parse best move from: ${data.bestmove}`);
        }
        const uci = match[1];

        return parseUciMoveToMoveObject(uci, game);
    }
}

function parseUciMoveToMoveObject(uci: string, game: Game): Move {
    const fromFile = uci[0];
    const fromRank = parseInt(uci[1], 10);
    const toFile = uci[2];
    const toRank = parseInt(uci[3], 10);

    const from = { x: fromFile.charCodeAt(0) - "a".charCodeAt(0), y: fromRank - 1 };
    const to = { x: toFile.charCodeAt(0) - "a".charCodeAt(0), y: toRank - 1 };

    const piece = game.board.getPieceAt(from);
    if (!piece) throw new Error(`No piece at ${uci.slice(0, 2)}`);

    const move: Move = {
        from,
        to,
        piece: piece.type,
        color: piece.color
    };

    if (uci.length === 5) {
        const promoChar = uci[4].toLowerCase();
        let promotion;
        if (promoChar === "q") promotion = "queen";
        else if (promoChar === "r") promotion = "rook";
        else if (promoChar === "b") promotion = "bishop";
        else if (promoChar === "n") promotion = "knight";
        if (promotion) (move as any).promotion = promotion;
    }
    return move;
}
