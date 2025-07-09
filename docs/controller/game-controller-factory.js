var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { GameController } from "./game-controller.js";
import { GameFactory } from "../chess/game/game-factory.js";
import { Color } from "../chess/types/color.js";
import { PlayerFactory } from "../player/player-factory.js";
import { FEN } from "../chess/util/fen.js";
export class GameControllerFactory {
    constructor() { }
    static createLocalVsBot(bot, color) {
        return __awaiter(this, void 0, void 0, function* () {
            const localColor = color !== null && color !== void 0 ? color : Color.White;
            const botColor = localColor === Color.White ? Color.Black : Color.White;
            if (bot.color !== botColor) {
                throw new Error(`Bot color mismatch: expected ${botColor}, got ${bot.color}`);
            }
            const localPlayer = PlayerFactory.createHumanPlayer("You", localColor);
            const controller = new GameController(localPlayer, bot);
            yield controller.init();
            return controller;
        });
    }
    static createLocalVsLocal(color) {
        return __awaiter(this, void 0, void 0, function* () {
            const player1Color = color !== null && color !== void 0 ? color : Color.White;
            const player2Color = player1Color === Color.White ? Color.Black : Color.White;
            const player1 = PlayerFactory.createHumanPlayer("Player 1", player1Color);
            const player2 = PlayerFactory.createHumanPlayer("Player 2", player2Color);
            const controller = new GameController(player1, player2);
            yield controller.init();
            return controller;
        });
    }
    static createLocalVsRemote(remotePlayer, color) {
        return __awaiter(this, void 0, void 0, function* () {
            const localColor = color !== null && color !== void 0 ? color : Color.White;
            const remoteColor = localColor === Color.White ? Color.Black : Color.White;
            if (remotePlayer.color !== remoteColor) {
                throw new Error(`Bot color mismatch: expected ${remoteColor}, got ${remotePlayer.color}`);
            }
            const localPlayer = PlayerFactory.createHumanPlayer("You", localColor);
            const controller = new GameController(localPlayer, remotePlayer);
            yield controller.init();
            return controller;
        });
    }
    static createLocalVsBotFromFEN(bot, fen, color) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!FEN.isValidFEN(fen))
                throw new Error("Error creating gamecontroller: Invalid FEN string");
            const localColor = color !== null && color !== void 0 ? color : Color.White;
            const botColor = localColor === Color.White ? Color.Black : Color.White;
            if (bot.color !== botColor) {
                throw new Error(`Bot color mismatch: expected ${botColor}, got ${bot.color}`);
            }
            const localPlayer = PlayerFactory.createHumanPlayer("You", localColor);
            const controller = new GameController(localPlayer, bot, GameFactory.fromFEN(fen));
            yield controller.init();
            return controller;
        });
    }
    static createLocalVsLocalFromFEN(fen, color) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!FEN.isValidFEN(fen))
                throw new Error("Error creating gamecontroller: Invalid FEN string");
            const player1Color = color !== null && color !== void 0 ? color : Color.White;
            const player2Color = player1Color === Color.White ? Color.Black : Color.White;
            const player1 = PlayerFactory.createHumanPlayer("Player 1", player1Color);
            const player2 = PlayerFactory.createHumanPlayer("Player 2", player2Color);
            const controller = new GameController(player1, player2, GameFactory.fromFEN(fen));
            yield controller.init();
            return controller;
        });
    }
    static createLocalVsRemoteFromFEN(remotePlayer, fen, color) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!FEN.isValidFEN(fen))
                throw new Error("Error creating gamecontroller: Invalid FEN string");
            const localColor = color !== null && color !== void 0 ? color : Color.White;
            const remoteColor = localColor === Color.White ? Color.Black : Color.White;
            if (remotePlayer.color !== remoteColor) {
                throw new Error(`Bot color mismatch: expected ${remoteColor}, got ${remotePlayer.color}`);
            }
            const localPlayer = PlayerFactory.createHumanPlayer("You", localColor);
            const controller = new GameController(localPlayer, remotePlayer, GameFactory.fromFEN(fen));
            yield controller.init();
            return controller;
        });
    }
    static loadSavedGame() {
        return __awaiter(this, void 0, void 0, function* () {
            const data = localStorage.getItem("cesariChessSave");
            if (!data)
                return null;
            try {
                const saveData = JSON.parse(data);
                if (!FEN.isValidFEN(saveData.fen))
                    throw new Error("Error creating gamecontroller from gamesave: Invalid FEN string");
                const game = GameFactory.fromFEN(saveData.fen);
                game.moveHistory = saveData.moveHistory;
                game.initialFEN = saveData.initialFen;
                const undoStack = [];
                let replayGame = GameFactory.fromFEN(saveData.initialFen);
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
                controller.historyManager.setUndoStack(undoStack);
                controller.updateControlButtons();
                yield controller.init();
                return controller;
            }
            catch (_a) {
                return null;
            }
        });
    }
}
