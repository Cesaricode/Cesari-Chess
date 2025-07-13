import { Color } from "./chess/types/color.js";
import { GameControllerFactory } from "./controller/game-controller-factory.js";
import { PlayerFactory } from "./player/player-factory.js";
import { Variant } from "./types/variant.js";
import { parseColor } from "./util/color.js";
import { getColorFromUrl, getContinueFromUrl, getFENFromUrl, getModeFromUrl, getVariantFromUrl } from "./util/url.js";

async function init() {
    const mode: string | null = getModeFromUrl();
    const variant: Variant = getVariantFromUrl();
    const colorParam: string | null = getColorFromUrl();
    const fen: string | null = getFENFromUrl();
    const color: Color | null = parseColor(colorParam);
    const continueValue: string | null = getContinueFromUrl();
    const startNewGame: boolean = sessionStorage.getItem("startNewGame") === "1";
    const hasSave: boolean = !!localStorage.getItem("cesariChessSave");

    if (!startNewGame && hasSave && (continueValue === "1" || !continueValue)) {
        GameControllerFactory.loadSavedGame();
        return;
    }

    sessionStorage.removeItem("startNewGame");

    if (mode === "self") {
        if (fen) await GameControllerFactory.createLocalVsLocalFromFEN(variant, fen, color ?? undefined);
        else await GameControllerFactory.createLocalVsLocal(variant, color ?? undefined);
        return;
    } else if (mode === "randy") {
        const botColor = color === Color.Black ? Color.White : Color.Black;
        if (fen) await GameControllerFactory.createLocalVsBotFromFEN(variant, PlayerFactory.createRandyBot(botColor), fen, color ?? undefined);
        else await GameControllerFactory.createLocalVsBot(variant, PlayerFactory.createRandyBot(botColor), color ?? undefined);
        return;
    } else if (mode === "stockfish") {
        const botColor = color === Color.Black ? Color.White : Color.Black;
        if (fen) await GameControllerFactory.createLocalVsBotFromFEN(variant, PlayerFactory.createStockfishBot(botColor), fen, color ?? undefined);
        else await GameControllerFactory.createLocalVsBot(variant, PlayerFactory.createStockfishBot(botColor), color ?? undefined);
        return;
    } else if (mode === "cesaribot") {
        const botColor = color === Color.Black ? Color.White : Color.Black;
        if (fen) await GameControllerFactory.createLocalVsBotFromFEN(variant, PlayerFactory.createCesariBot(botColor), fen, color ?? undefined);
        else await GameControllerFactory.createLocalVsBot(variant, PlayerFactory.createCesariBot(botColor), color ?? undefined);
        return;
    } else if (mode) {
        if (fen) await GameControllerFactory.createLocalVsLocalFromFEN(variant, fen, color ?? undefined);
        else await GameControllerFactory.createLocalVsLocal(variant, color ?? undefined);
        return;
    } else {
        abortGameInit();
    }
}

function abortGameInit(): void {
    console.error("No valid gamemode or savestate provided. Redirecting to homepage");
    window.location.href = "index.html";
}

init();