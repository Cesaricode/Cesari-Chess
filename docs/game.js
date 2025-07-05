import { Color } from "./chess/types/color.js";
import { GameControllerFactory } from "./controller/game-controller-factory.js";
import { PlayerFactory } from "./player/player-factory.js";
import { getModeFromUrl } from "./util/url.js";
function init() {
    const mode = getModeFromUrl();
    if (mode === "self") {
        GameControllerFactory.createLocalVsLocal();
    }
    else if (mode === "randy") {
        GameControllerFactory.createLocalVsBot(PlayerFactory.createRandyBot(Color.Black));
    }
    else if (mode === "stockfish") {
        GameControllerFactory.createLocalVsBot(PlayerFactory.createStockfishBot(Color.Black));
    }
    else if (mode === "cesaribot") {
        GameControllerFactory.createLocalVsBot(PlayerFactory.createRandyBot(Color.Black));
    }
    else {
        GameControllerFactory.createLocalVsLocal();
    }
}
init();
