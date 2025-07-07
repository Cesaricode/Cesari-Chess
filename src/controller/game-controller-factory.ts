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

    public static createLocalVsBot(bot: Player, color?: Color): GameController {
        const localColor: Color = color ?? Color.White;
        const botColor: Color = localColor === Color.White ? Color.Black : Color.White;
        if (bot.color !== botColor) {
            throw new Error(`Bot color mismatch: expected ${botColor}, got ${bot.color}`);
        }
        const localPlayer: Player = PlayerFactory.createHumanPlayer("You", localColor);
        return new GameController(localPlayer, bot);
    }

    public static createLocalVsLocal(color?: Color): GameController {
        const player1Color: Color = color ?? Color.White;
        const player2Color: Color = player1Color === Color.White ? Color.Black : Color.White;
        const player1: Player = PlayerFactory.createHumanPlayer("Player 1", player1Color);
        const player2: Player = PlayerFactory.createHumanPlayer("Player 2", player2Color);
        return new GameController(player1, player2);
    }

    public static createLocalVsRemote(remotePlayer: Player, color?: Color): GameController {
        const localColor: Color = color ?? Color.White;
        const remoteColor: Color = localColor === Color.White ? Color.Black : Color.White;
        if (remotePlayer.color !== remoteColor) {
            throw new Error(`Bot color mismatch: expected ${remoteColor}, got ${remotePlayer.color}`);
        }
        const localPlayer: Player = PlayerFactory.createHumanPlayer("You", localColor);
        return new GameController(localPlayer, remotePlayer);
    }

    public static createLocalVsBotFromFEN(bot: Player, fen: string, color?: Color): GameController {
        const localColor: Color = color ?? Color.White;
        const botColor: Color = localColor === Color.White ? Color.Black : Color.White;
        if (bot.color !== botColor) {
            throw new Error(`Bot color mismatch: expected ${botColor}, got ${bot.color}`);
        }
        const localPlayer: Player = PlayerFactory.createHumanPlayer("You", localColor);
        return new GameController(localPlayer, bot, GameFactory.fromFEN(fen));
    }

    public static createLocalVsLocalFromFEN(fen: string, color?: Color): GameController {
        const player1Color: Color = color ?? Color.White;
        const player2Color: Color = player1Color === Color.White ? Color.Black : Color.White;
        const player1: Player = PlayerFactory.createHumanPlayer("Player 1", player1Color);
        const player2: Player = PlayerFactory.createHumanPlayer("Player 2", player2Color);
        return new GameController(player1, player2, GameFactory.fromFEN(fen));
    }

    public static createLocalVsRemoteFromFEN(remotePlayer: Player, fen: string, color?: Color): GameController {
        const localColor: Color = color ?? Color.White;
        const remoteColor: Color = localColor === Color.White ? Color.Black : Color.White;
        if (remotePlayer.color !== remoteColor) {
            throw new Error(`Bot color mismatch: expected ${remoteColor}, got ${remotePlayer.color}`);
        }
        const localPlayer: Player = PlayerFactory.createHumanPlayer("You", localColor);
        return new GameController(localPlayer, remotePlayer, GameFactory.fromFEN(fen));
    }

    public static loadSavedGame(): GameController | null {
        const data: string | null = localStorage.getItem("cesariChessSave");
        if (!data) return null;
        try {
            const saveData: SaveGameData = JSON.parse(data);
            const game: Game = FEN.gameFromFEN(saveData.fen);
            game.moveHistory = saveData.moveHistory;

            const undoStack: Game[] = [];
            let replayGame = GameFactory.fromStartingPosition();
            for (const move of saveData.moveHistory) {
                undoStack.push(replayGame.clone());
                console.log("lsg", replayGame.clone());
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
            controller.setUndoStack(undoStack);
            controller.updateControlButtons();

            return controller;
        } catch {
            return null;
        }
    }
}