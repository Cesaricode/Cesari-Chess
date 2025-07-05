import { Color } from "./chess/types/color.js";
import { GameControllerFactory } from "./controller/game-controller-factory.js";
import { PlayerFactory } from "./player/player-factory.js";

function getModeFromUrl() {
    const params: URLSearchParams = new URLSearchParams(window.location.search);
    return params.get("mode") || "self";
}

function init() {
    const mode: string = getModeFromUrl();
    if (mode === "self") {
        GameControllerFactory.createLocalVsLocal();
    } else if (mode === "randy") {
        GameControllerFactory.createLocalVsBot(PlayerFactory.createRandyBot(Color.Black));
    } else if (mode === "stockfish") {
        GameControllerFactory.createLocalVsBot(PlayerFactory.createStockfishBot(Color.Black));
    } else if (mode === "cesaribot") {
        const cesariBot = { name: "Cesari-Bot", isBot: true, color: Color.Black };
        GameControllerFactory.createLocalVsBot(cesariBot);
    } else {
        GameControllerFactory.createLocalVsLocal();
    }
}

init();