import { Color } from "../chess/types/color.js";
import { HumanPlayer } from "./human-player.js";
import { RandyBot } from "./bots/randy.js";
import { StockfishBot } from "./bots/stockfish.js";

export class PlayerFactory {
    static createHumanPlayer(name: string, color: Color) {
        return new HumanPlayer(name, color);
    }

    static createRandyBot(color: Color) {
        return new RandyBot(color);
    }

    static createStockfishBot(color: Color) {
        return new StockfishBot(color);
    }
}