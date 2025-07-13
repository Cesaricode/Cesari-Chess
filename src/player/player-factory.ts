import { Color } from "../chess/types/color.js";
import { HumanPlayer } from "./human-player.js";
import { RandyBot } from "./bots/randy.js";
import { StockfishBot } from "./bots/stockfish.js";
import { CesariBot } from "./bots/cesari.js";

export class PlayerFactory {

    private constructor() { }

    public static createHumanPlayer(name: string, color: Color) {
        return new HumanPlayer(name, color);
    }

    public static createRandyBot(color: Color) {
        return new RandyBot(color);
    }

    public static createStockfishBot(color: Color) {
        return new StockfishBot(color);
    }

    public static createCesariBot(color: Color) {
        return new CesariBot(color);
    }
}