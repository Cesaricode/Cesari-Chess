import { GameController } from "./game-controller.js";
import { GameFactory } from "../chess/game/game-factory.js";
export class GameControllerFactory {
    constructor() { }
    static createLocalVsBot(bot) {
        const localPlayer = { name: "You", isBot: false };
        return new GameController(localPlayer, bot);
    }
    static createLocalVsLocal() {
        const player1 = { name: "Player 1", isBot: false };
        const player2 = { name: "Player 2", isBot: false };
        return new GameController(player1, player2);
    }
    static createLocalVsBotFromFEN(bot, fen) {
        const localPlayer = { name: "You", isBot: false };
        return new GameController(localPlayer, bot, GameFactory.fromFEN(fen));
    }
    static createLocalVsLocalFromFEN(fen) {
        const player1 = { name: "Player 1", isBot: false };
        const player2 = { name: "Player 2", isBot: false };
        return new GameController(player1, player2, GameFactory.fromFEN(fen));
    }
}
