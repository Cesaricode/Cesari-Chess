import { GameController } from "./game-controller.js";
import { GameFactory } from "../chess/game/game-factory.js";
import { Color } from "../chess/types/color.js";
import { PlayerFactory } from "../player/player-factory.js";
export class GameControllerFactory {
    constructor() { }
    static createLocalVsBot(bot) {
        const localPlayer = PlayerFactory.createHumanPlayer("You", Color.White);
        return new GameController(localPlayer, bot);
    }
    static createLocalVsLocal() {
        const player1 = PlayerFactory.createHumanPlayer("Player 1", Color.White);
        const player2 = PlayerFactory.createHumanPlayer("Player 2", Color.Black);
        return new GameController(player1, player2);
    }
    static createLocalVsRemote(remotePlayer) {
        const localPlayer = PlayerFactory.createHumanPlayer("You", Color.White);
        return new GameController(localPlayer, remotePlayer);
    }
    static createLocalVsBotFromFEN(bot, fen) {
        const localPlayer = PlayerFactory.createHumanPlayer("You", Color.White);
        return new GameController(localPlayer, bot, GameFactory.fromFEN(fen));
    }
    static createLocalVsLocalFromFEN(fen) {
        const player1 = PlayerFactory.createHumanPlayer("Player 1", Color.White);
        const player2 = PlayerFactory.createHumanPlayer("Player 2", Color.Black);
        return new GameController(player1, player2, GameFactory.fromFEN(fen));
    }
    static createLocalVsRemoteFromFEN(remotePlayer, fen) {
        const localPlayer = PlayerFactory.createHumanPlayer("You", Color.White);
        return new GameController(localPlayer, remotePlayer, GameFactory.fromFEN(fen));
    }
}
