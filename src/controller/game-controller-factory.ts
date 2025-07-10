import { GameController } from "./game-controller.js";
import { Player } from "../player/player.js";
import { GameFactory } from "../chess/game/game-factory.js";
import { Color } from "../chess/types/color.js";
import { PlayerFactory } from "../player/player-factory.js";
import { Game } from "../chess/game/game.js";
import { FEN } from "../chess/util/fen.js";
import { SaveGameData } from "../types/save-game-data.js";

export class GameControllerFactory {

    private constructor() { }

    // Standard games

    public static async createLocalVsBot(bot: Player, color?: Color): Promise<GameController> {
        const localColor: Color = color ?? Color.White;
        const botColor: Color = localColor === Color.White ? Color.Black : Color.White;
        if (bot.color !== botColor) {
            throw new Error(`Bot color mismatch: expected ${botColor}, got ${bot.color}`);
        }
        const localPlayer: Player = PlayerFactory.createHumanPlayer("You", localColor);
        const controller: GameController = new GameController(localPlayer, bot);
        await controller.init();
        return controller;
    }

    public static async createLocalVsLocal(color?: Color): Promise<GameController> {
        const player1Color: Color = color ?? Color.White;
        const player2Color: Color = player1Color === Color.White ? Color.Black : Color.White;
        const player1: Player = PlayerFactory.createHumanPlayer("Player 1", player1Color);
        const player2: Player = PlayerFactory.createHumanPlayer("Player 2", player2Color);
        const controller: GameController = new GameController(player1, player2);
        await controller.init();
        return controller;
    }

    public static async createLocalVsRemote(remotePlayer: Player, color?: Color): Promise<GameController> {
        const localColor: Color = color ?? Color.White;
        const remoteColor: Color = localColor === Color.White ? Color.Black : Color.White;
        if (remotePlayer.color !== remoteColor) {
            throw new Error(`Bot color mismatch: expected ${remoteColor}, got ${remotePlayer.color}`);
        }
        const localPlayer: Player = PlayerFactory.createHumanPlayer("You", localColor);
        const controller: GameController = new GameController(localPlayer, remotePlayer);
        await controller.init();
        return controller;
    }

    // Games from FEN

    public static async createLocalVsBotFromFEN(bot: Player, fen: string, color?: Color): Promise<GameController> {
        if (!FEN.isValidFEN(fen)) throw new Error("Error creating gamecontroller: Invalid FEN string");
        const localColor: Color = color ?? Color.White;
        const botColor: Color = localColor === Color.White ? Color.Black : Color.White;
        if (bot.color !== botColor) {
            throw new Error(`Bot color mismatch: expected ${botColor}, got ${bot.color}`);
        }
        const localPlayer: Player = PlayerFactory.createHumanPlayer("You", localColor);
        const controller: GameController = new GameController(localPlayer, bot, GameFactory.fromFEN(fen));
        await controller.init();
        return controller;
    }

    public static async createLocalVsLocalFromFEN(fen: string, color?: Color): Promise<GameController> {
        if (!FEN.isValidFEN(fen)) throw new Error("Error creating gamecontroller: Invalid FEN string");
        const player1Color: Color = color ?? Color.White;
        const player2Color: Color = player1Color === Color.White ? Color.Black : Color.White;
        const player1: Player = PlayerFactory.createHumanPlayer("Player 1", player1Color);
        const player2: Player = PlayerFactory.createHumanPlayer("Player 2", player2Color);
        const controller: GameController = new GameController(player1, player2, GameFactory.fromFEN(fen));
        await controller.init();
        return controller;
    }

    public static async createLocalVsRemoteFromFEN(remotePlayer: Player, fen: string, color?: Color): Promise<GameController> {
        if (!FEN.isValidFEN(fen)) throw new Error("Error creating gamecontroller: Invalid FEN string");
        const localColor: Color = color ?? Color.White;
        const remoteColor: Color = localColor === Color.White ? Color.Black : Color.White;
        if (remotePlayer.color !== remoteColor) {
            throw new Error(`Bot color mismatch: expected ${remoteColor}, got ${remotePlayer.color}`);
        }
        const localPlayer: Player = PlayerFactory.createHumanPlayer("You", localColor);
        const controller: GameController = new GameController(localPlayer, remotePlayer, GameFactory.fromFEN(fen));
        await controller.init();
        return controller;
    }

    // Games from savestate

    public static async loadSavedGame(): Promise<GameController | null> {
        const data: string | null = localStorage.getItem("cesariChessSave");
        if (!data) return null;
        try {
            const saveData: SaveGameData = JSON.parse(data);
            if (!FEN.isValidFEN(saveData.fen)) throw new Error("Error creating gamecontroller from gamesave: Invalid FEN string");
            const game: Game = GameFactory.fromFEN(saveData.fen);
            game.moveHistory = saveData.moveHistory;
            game.initialFEN = saveData.initialFen;

            const undoStack: Game[] = [];
            let replayGame: Game = GameFactory.fromFEN(saveData.initialFen);
            for (const move of saveData.moveHistory) {
                undoStack.push(replayGame.clone());
                replayGame.makeMove(move);
            }

            const localPlayer: Player = PlayerFactory.createHumanPlayer("You", saveData.localColor);
            let bot: Player;
            if (saveData.botType === "Stockfish") {
                bot = PlayerFactory.createStockfishBot(saveData.botColor);
            } else if (saveData.botType === "Cesari-Bot") {
                bot = PlayerFactory.createRandyBot(saveData.botColor);
            } else {
                bot = PlayerFactory.createRandyBot(saveData.botColor);
            }

            const controller: GameController = new GameController(localPlayer, bot, game);
            controller.historyManager.setUndoStack(undoStack);
            controller.updateControlButtons();
            await controller.init();
            return controller;
        } catch {
            return null;
        }
    }
}