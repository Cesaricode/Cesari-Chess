import { GameController } from "./game-controller.js";
import { Player } from "../player/player.js";
import { Game } from "../chess/game/game.js";
import { GameFactory } from "../chess/game/game-factory.js";
import { Color } from "../chess/types/color.js";
import { PlayerFactory } from "../player/player-factory.js";

export class GameControllerFactory {

    private constructor() { }

    static createLocalVsBot(bot: Player): GameController {
        const localPlayer: Player = PlayerFactory.createHumanPlayer("You", Color.White);
        return new GameController(localPlayer, bot);
    }

    static createLocalVsLocal(): GameController {
        const player1: Player = PlayerFactory.createHumanPlayer("Player 1", Color.White);
        const player2: Player = PlayerFactory.createHumanPlayer("Player 2", Color.Black);
        return new GameController(player1, player2);
    }

    static createLocalVsRemote(remotePlayer: Player): GameController {
        const localPlayer: Player = PlayerFactory.createHumanPlayer("You", Color.White);
        return new GameController(localPlayer, remotePlayer);
    }

    static createLocalVsBotFromFEN(bot: Player, fen: string): GameController {
        const localPlayer: Player = PlayerFactory.createHumanPlayer("You", Color.White);
        return new GameController(localPlayer, bot, GameFactory.fromFEN(fen));
    }

    static createLocalVsLocalFromFEN(fen: string): GameController {
        const player1: Player = PlayerFactory.createHumanPlayer("Player 1", Color.White);
        const player2: Player = PlayerFactory.createHumanPlayer("Player 2", Color.Black);
        return new GameController(player1, player2, GameFactory.fromFEN(fen));
    }

    static createLocalVsRemoteFromFEN(remotePlayer: Player, fen: string): GameController {
        const localPlayer: Player = PlayerFactory.createHumanPlayer("You", Color.White);
        return new GameController(localPlayer, remotePlayer, GameFactory.fromFEN(fen));
    }
}