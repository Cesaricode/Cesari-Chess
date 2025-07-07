import { Color } from "./chess/types/color.js";
import { GameControllerFactory } from "./controller/game-controller-factory.js";
import { PlayerFactory } from "./player/player-factory.js";
import { getColorFromUrl, getContinueFromUrl, getFENFromUrl, getModeFromUrl } from "./util/url.js";

function parseColor(color: string | null): Color | null {
    if (!color) return null;
    if (color.toLowerCase() === "white") return Color.White;
    if (color.toLowerCase() === "black") return Color.Black;
    return null;
}

function init() {
    const mode: string = getModeFromUrl();
    const colorParam: string = getColorFromUrl();
    const fen: string | null = getFENFromUrl();
    const color: Color | null = parseColor(colorParam);
    const continueValue: string | null = getContinueFromUrl();
    const startNewGame: boolean = sessionStorage.getItem("startNewGame") === "1";
    const hasSave: boolean = !!localStorage.getItem("cesariChessSave");
    if (!startNewGame && continueValue === "1" && hasSave) {
        GameControllerFactory.loadSavedGame();
        return;
    }

    if (!startNewGame && !continueValue && hasSave) {
        GameControllerFactory.loadSavedGame();
        return;
    }

    sessionStorage.removeItem("startNewGame");

    if (continueValue === "1") {
        GameControllerFactory.loadSavedGame();
        return;
    }

    if (mode === "self") {
        if (fen) GameControllerFactory.createLocalVsLocalFromFEN(fen, color ?? undefined);
        else GameControllerFactory.createLocalVsLocal(color ?? undefined);
    } else if (mode === "randy") {
        const botColor = color === Color.Black ? Color.White : Color.Black;
        if (fen) GameControllerFactory.createLocalVsBotFromFEN(PlayerFactory.createRandyBot(botColor), fen, color ?? undefined);
        else GameControllerFactory.createLocalVsBot(PlayerFactory.createRandyBot(botColor), color ?? undefined);
    } else if (mode === "stockfish") {
        const botColor = color === Color.Black ? Color.White : Color.Black;
        if (fen) GameControllerFactory.createLocalVsBotFromFEN(PlayerFactory.createStockfishBot(botColor), fen, color ?? undefined);
        else GameControllerFactory.createLocalVsBot(PlayerFactory.createStockfishBot(botColor), color ?? undefined);
    } else if (mode === "cesaribot") {
        const botColor = color === Color.Black ? Color.White : Color.Black;
        if (fen) GameControllerFactory.createLocalVsBotFromFEN(PlayerFactory.createRandyBot(botColor), fen, color ?? undefined);
        else GameControllerFactory.createLocalVsBot(PlayerFactory.createRandyBot(botColor), color ?? undefined);
    } else {
        if (fen) GameControllerFactory.createLocalVsLocalFromFEN(fen, color ?? undefined);
        else GameControllerFactory.createLocalVsLocal(color ?? undefined);
    }
}

init();