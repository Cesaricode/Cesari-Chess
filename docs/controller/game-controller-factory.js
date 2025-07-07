import { GameController } from "./game-controller.js";
import { GameFactory } from "../chess/game/game-factory.js";
import { Color } from "../chess/types/color.js";
import { PlayerFactory } from "../player/player-factory.js";
import { FEN } from "../chess/util/fen.js";
export class GameControllerFactory {
    constructor() { }
    static createLocalVsBot(bot, color) {
        const localColor = color !== null && color !== void 0 ? color : Color.White;
        const botColor = localColor === Color.White ? Color.Black : Color.White;
        if (bot.color !== botColor) {
            throw new Error(`Bot color mismatch: expected ${botColor}, got ${bot.color}`);
        }
        const localPlayer = PlayerFactory.createHumanPlayer("You", localColor);
        return new GameController(localPlayer, bot);
    }
    static createLocalVsLocal(color) {
        const player1Color = color !== null && color !== void 0 ? color : Color.White;
        const player2Color = player1Color === Color.White ? Color.Black : Color.White;
        const player1 = PlayerFactory.createHumanPlayer("Player 1", player1Color);
        const player2 = PlayerFactory.createHumanPlayer("Player 2", player2Color);
        return new GameController(player1, player2);
    }
    static createLocalVsRemote(remotePlayer, color) {
        const localColor = color !== null && color !== void 0 ? color : Color.White;
        const remoteColor = localColor === Color.White ? Color.Black : Color.White;
        if (remotePlayer.color !== remoteColor) {
            throw new Error(`Bot color mismatch: expected ${remoteColor}, got ${remotePlayer.color}`);
        }
        const localPlayer = PlayerFactory.createHumanPlayer("You", localColor);
        return new GameController(localPlayer, remotePlayer);
    }
    static createLocalVsBotFromFEN(bot, fen, color) {
        const localColor = color !== null && color !== void 0 ? color : Color.White;
        const botColor = localColor === Color.White ? Color.Black : Color.White;
        if (bot.color !== botColor) {
            throw new Error(`Bot color mismatch: expected ${botColor}, got ${bot.color}`);
        }
        const localPlayer = PlayerFactory.createHumanPlayer("You", localColor);
        return new GameController(localPlayer, bot, GameFactory.fromFEN(fen));
    }
    static createLocalVsLocalFromFEN(fen, color) {
        const player1Color = color !== null && color !== void 0 ? color : Color.White;
        const player2Color = player1Color === Color.White ? Color.Black : Color.White;
        const player1 = PlayerFactory.createHumanPlayer("Player 1", player1Color);
        const player2 = PlayerFactory.createHumanPlayer("Player 2", player2Color);
        return new GameController(player1, player2, GameFactory.fromFEN(fen));
    }
    static createLocalVsRemoteFromFEN(remotePlayer, fen, color) {
        const localColor = color !== null && color !== void 0 ? color : Color.White;
        const remoteColor = localColor === Color.White ? Color.Black : Color.White;
        if (remotePlayer.color !== remoteColor) {
            throw new Error(`Bot color mismatch: expected ${remoteColor}, got ${remotePlayer.color}`);
        }
        const localPlayer = PlayerFactory.createHumanPlayer("You", localColor);
        return new GameController(localPlayer, remotePlayer, GameFactory.fromFEN(fen));
    }
    static loadSavedGame() {
        const data = localStorage.getItem("cesariChessSave");
        if (!data)
            return null;
        try {
            const saveData = JSON.parse(data);
            const game = FEN.gameFromFEN(saveData.fen);
            game.moveHistory = saveData.moveHistory;
            const undoStack = [];
            let replayGame = GameFactory.fromStartingPosition();
            for (const move of saveData.moveHistory) {
                undoStack.push(replayGame.clone());
                replayGame.makeMove(move);
            }
            const localPlayer = PlayerFactory.createHumanPlayer("You", saveData.localColor);
            let bot;
            if (saveData.botType === "Stockfish") {
                bot = PlayerFactory.createStockfishBot(saveData.botColor);
            }
            else if (saveData.botType === "Cesari-Bot") {
                bot = PlayerFactory.createRandyBot(saveData.botColor);
            }
            else {
                bot = PlayerFactory.createRandyBot(saveData.botColor);
            }
            const controller = new GameController(localPlayer, bot, game);
            controller.setUndoStack(undoStack);
            controller.updateControlButtons();
            return controller;
        }
        catch (_a) {
            return null;
        }
    }
}
