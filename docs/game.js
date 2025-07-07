import { Color } from "./chess/types/color.js";
import { GameControllerFactory } from "./controller/game-controller-factory.js";
import { PlayerFactory } from "./player/player-factory.js";
import { getColorFromUrl, getContinueFromUrl, getFENFromUrl, getModeFromUrl } from "./util/url.js";
function parseColor(color) {
    if (!color)
        return null;
    if (color.toLowerCase() === "white")
        return Color.White;
    if (color.toLowerCase() === "black")
        return Color.Black;
    return null;
}
function init() {
    const mode = getModeFromUrl();
    const colorParam = getColorFromUrl();
    const fen = getFENFromUrl();
    const color = parseColor(colorParam);
    const continueValue = getContinueFromUrl();
    if (continueValue === "1") {
        GameControllerFactory.loadSavedGame();
        return;
    }
    if (mode === "self") {
        if (fen)
            GameControllerFactory.createLocalVsLocalFromFEN(fen, color !== null && color !== void 0 ? color : undefined);
        else
            GameControllerFactory.createLocalVsLocal(color !== null && color !== void 0 ? color : undefined);
    }
    else if (mode === "randy") {
        const botColor = color === Color.Black ? Color.White : Color.Black;
        if (fen)
            GameControllerFactory.createLocalVsBotFromFEN(PlayerFactory.createRandyBot(botColor), fen, color !== null && color !== void 0 ? color : undefined);
        else
            GameControllerFactory.createLocalVsBot(PlayerFactory.createRandyBot(botColor), color !== null && color !== void 0 ? color : undefined);
    }
    else if (mode === "stockfish") {
        const botColor = color === Color.Black ? Color.White : Color.Black;
        if (fen)
            GameControllerFactory.createLocalVsBotFromFEN(PlayerFactory.createStockfishBot(botColor), fen, color !== null && color !== void 0 ? color : undefined);
        else
            GameControllerFactory.createLocalVsBot(PlayerFactory.createStockfishBot(botColor), color !== null && color !== void 0 ? color : undefined);
    }
    else if (mode === "cesaribot") {
        const botColor = color === Color.Black ? Color.White : Color.Black;
        if (fen)
            GameControllerFactory.createLocalVsBotFromFEN(PlayerFactory.createRandyBot(botColor), fen, color !== null && color !== void 0 ? color : undefined);
        else
            GameControllerFactory.createLocalVsBot(PlayerFactory.createRandyBot(botColor), color !== null && color !== void 0 ? color : undefined);
    }
    else {
        if (fen)
            GameControllerFactory.createLocalVsLocalFromFEN(fen, color !== null && color !== void 0 ? color : undefined);
        else
            GameControllerFactory.createLocalVsLocal(color !== null && color !== void 0 ? color : undefined);
    }
}
init();
