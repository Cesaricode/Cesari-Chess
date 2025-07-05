import { HumanPlayer } from "./human-player.js";
import { RandyBot } from "./bots/randy.js";
import { StockfishBot } from "./bots/stockfish.js";
export class PlayerFactory {
    static createHumanPlayer(name, color) {
        return new HumanPlayer(name, color);
    }
    static createRandyBot(color) {
        return new RandyBot(color);
    }
    static createStockfishBot(color) {
        return new StockfishBot(color);
    }
}
