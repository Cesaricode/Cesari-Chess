import { BotPlayer } from "../bot-player.js";
import { Game } from "../../chess/game/game.js";
import { Move } from "../../chess/types/move.js";
import { Color } from "../../chess/types/color.js";
import { StockfishService } from "../../engine/stockfish-service.js";

export class StockfishBot extends BotPlayer {
    constructor(color: Color) {
        super("Stockfish", color);
    }

    async getMove(game: Game): Promise<Move> {
        return StockfishService.getBestMove(game);
    }
}