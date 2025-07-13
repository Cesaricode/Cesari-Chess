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
import { BaseMoveValidator } from "../chess/rules/base-move-validator.js";
import { Variant } from "../types/variant.js";
import { FischerandomMoveValidator } from "../chess/rules/fischerandom-move-validator.js";
export class GameControllerFactory {
    constructor() { }
    // Standard games
    static createLocalVsBot(variant, bot, color) {
        return __awaiter(this, void 0, void 0, function* () {
            const localColor = color !== null && color !== void 0 ? color : Color.White;
            const botColor = localColor === Color.White ? Color.Black : Color.White;
            if (bot.color !== botColor) {
                throw new Error(`Bot color mismatch: expected ${botColor}, got ${bot.color}`);
            }
            const localPlayer = PlayerFactory.createHumanPlayer("You", localColor);
            const moveValidator = variant === Variant.Fischerandom
                ? new FischerandomMoveValidator()
                : new BaseMoveValidator();
            const game = GameFactory.fromStartingPosition(moveValidator, variant);
            const controller = new GameController(localPlayer, bot, moveValidator, game);
            yield controller.init();
            return controller;
        });
    }
    static createLocalVsLocal(variant, color) {
        return __awaiter(this, void 0, void 0, function* () {
            const player1Color = color !== null && color !== void 0 ? color : Color.White;
            const player2Color = player1Color === Color.White ? Color.Black : Color.White;
            const player1 = PlayerFactory.createHumanPlayer("Player 1", player1Color);
            const player2 = PlayerFactory.createHumanPlayer("Player 2", player2Color);
            const moveValidator = variant === Variant.Fischerandom
                ? new FischerandomMoveValidator()
                : new BaseMoveValidator();
            const game = GameFactory.fromStartingPosition(moveValidator, variant);
            const controller = new GameController(player1, player2, moveValidator, game);
            yield controller.init();
            return controller;
        });
    }
    static createLocalVsRemote(variant, remotePlayer, color) {
        return __awaiter(this, void 0, void 0, function* () {
            const localColor = color !== null && color !== void 0 ? color : Color.White;
            const remoteColor = localColor === Color.White ? Color.Black : Color.White;
            if (remotePlayer.color !== remoteColor) {
                throw new Error(`Bot color mismatch: expected ${remoteColor}, got ${remotePlayer.color}`);
            }
            const localPlayer = PlayerFactory.createHumanPlayer("You", localColor);
            const moveValidator = variant === Variant.Fischerandom
                ? new FischerandomMoveValidator()
                : new BaseMoveValidator();
            const game = GameFactory.fromStartingPosition(moveValidator, variant);
            const controller = new GameController(localPlayer, remotePlayer, moveValidator, game);
            yield controller.init();
            return controller;
        });
    }
    // Games from FEN
    static createLocalVsBotFromFEN(variant, bot, fen, color) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!FEN.isValidFEN(fen))
                throw new Error("Error creating gamecontroller: Invalid FEN string");
            const localColor = color !== null && color !== void 0 ? color : Color.White;
            const botColor = localColor === Color.White ? Color.Black : Color.White;
            if (bot.color !== botColor) {
                throw new Error(`Bot color mismatch: expected ${botColor}, got ${bot.color}`);
            }
            const localPlayer = PlayerFactory.createHumanPlayer("You", localColor);
            const moveValidator = variant === Variant.Fischerandom
                ? new FischerandomMoveValidator()
                : new BaseMoveValidator();
            const game = GameFactory.fromFEN(fen, moveValidator, variant);
            const controller = new GameController(localPlayer, bot, moveValidator, game);
            yield controller.init();
            return controller;
        });
    }
    static createLocalVsLocalFromFEN(variant, fen, color) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!FEN.isValidFEN(fen))
                throw new Error("Error creating gamecontroller: Invalid FEN string");
            const player1Color = color !== null && color !== void 0 ? color : Color.White;
            const player2Color = player1Color === Color.White ? Color.Black : Color.White;
            const player1 = PlayerFactory.createHumanPlayer("Player 1", player1Color);
            const player2 = PlayerFactory.createHumanPlayer("Player 2", player2Color);
            const moveValidator = variant === Variant.Fischerandom
                ? new FischerandomMoveValidator()
                : new BaseMoveValidator();
            const game = GameFactory.fromFEN(fen, moveValidator, variant);
            const controller = new GameController(player1, player2, moveValidator, game);
            yield controller.init();
            return controller;
        });
    }
    static createLocalVsRemoteFromFEN(variant, remotePlayer, fen, color) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!FEN.isValidFEN(fen))
                throw new Error("Error creating gamecontroller: Invalid FEN string");
            const localColor = color !== null && color !== void 0 ? color : Color.White;
            const remoteColor = localColor === Color.White ? Color.Black : Color.White;
            if (remotePlayer.color !== remoteColor) {
                throw new Error(`Bot color mismatch: expected ${remoteColor}, got ${remotePlayer.color}`);
            }
            const localPlayer = PlayerFactory.createHumanPlayer("You", localColor);
            const moveValidator = variant === Variant.Fischerandom
                ? new FischerandomMoveValidator()
                : new BaseMoveValidator();
            const game = GameFactory.fromFEN(fen, moveValidator, variant);
            const controller = new GameController(localPlayer, remotePlayer, moveValidator, game);
            yield controller.init();
            return controller;
        });
    }
    // Games from savestate
    static loadSavedGame() {
        return __awaiter(this, void 0, void 0, function* () {
            const data = localStorage.getItem("cesariChessSave");
            if (!data)
                return null;
            try {
                const saveData = JSON.parse(data);
                if (!FEN.isValidFEN(saveData.fen))
                    throw new Error("Error creating gamecontroller from gamesave: Invalid FEN string");
                const moveValidator = saveData.variant === Variant.Fischerandom
                    ? new FischerandomMoveValidator()
                    : new BaseMoveValidator();
                const game = GameFactory.fromFEN(saveData.fen, moveValidator, saveData.variant);
                game.moveHistory = saveData.moveHistory;
                game.initialFEN = saveData.initialFen;
                const undoStack = [];
                let replayGame = GameFactory.fromFEN(saveData.initialFen, moveValidator, saveData.variant);
                for (const move of saveData.moveHistory) {
                    undoStack.push(replayGame.clone());
                    replayGame.makeMove(move);
                }
                const localPlayer = PlayerFactory.createHumanPlayer("You", saveData.localColor);
                let bot;
                if (saveData.botType === "Stockfish") {
                    bot = PlayerFactory.createStockfishBot(saveData.botColor);
                }
                else if (saveData.botType === "Cesari") {
                    bot = PlayerFactory.createCesariBot(saveData.botColor);
                }
                else {
                    bot = PlayerFactory.createRandyBot(saveData.botColor);
                }
                const controller = new GameController(localPlayer, bot, moveValidator, game);
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
