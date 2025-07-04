import { GameController } from "./game-controller.js";
import { Player } from "../player/player.js";
import { Game } from "../chess/game/game.js";
import { GameFactory } from "../chess/game/game-factory.js";

export class GameControllerFactory {

    private constructor() { }

    static createLocalVsBot(bot: Player): GameController {
        const localPlayer: Player = { name: "You", isBot: false };
        return new GameController(localPlayer, bot);
    }

    static createLocalVsLocal(): GameController {
        const player1: Player = { name: "Player 1", isBot: false };
        const player2: Player = { name: "Player 2", isBot: false };
        return new GameController(player1, player2);
    }

    static createLocalVsBotFromFEN(bot: Player, fen: string): GameController {
        const localPlayer: Player = { name: "You", isBot: false };
        return new GameController(localPlayer, bot, GameFactory.fromFEN(fen));
    }

    static createLocalVsLocalFromFEN(fen: string): GameController {
        const player1: Player = { name: "Player 1", isBot: false };
        const player2: Player = { name: "Player 2", isBot: false };
        return new GameController(player1, player2, GameFactory.fromFEN(fen));
    }
}