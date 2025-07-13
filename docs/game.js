var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Color } from "./chess/types/color.js";
import { GameControllerFactory } from "./controller/game-controller-factory.js";
import { PlayerFactory } from "./player/player-factory.js";
import { parseColor } from "./util/color.js";
import { getColorFromUrl, getContinueFromUrl, getFENFromUrl, getModeFromUrl, getVariantFromUrl } from "./util/url.js";
function init() {
    return __awaiter(this, void 0, void 0, function* () {
        const mode = getModeFromUrl();
        const variant = getVariantFromUrl();
        const colorParam = getColorFromUrl();
        const fen = getFENFromUrl();
        const color = parseColor(colorParam);
        const continueValue = getContinueFromUrl();
        const startNewGame = sessionStorage.getItem("startNewGame") === "1";
        const hasSave = !!localStorage.getItem("cesariChessSave");
        if (!startNewGame && hasSave && (continueValue === "1" || !continueValue)) {
            GameControllerFactory.loadSavedGame();
            return;
        }
        sessionStorage.removeItem("startNewGame");
        if (mode === "self") {
            if (fen)
                yield GameControllerFactory.createLocalVsLocalFromFEN(variant, fen, color !== null && color !== void 0 ? color : undefined);
            else
                yield GameControllerFactory.createLocalVsLocal(variant, color !== null && color !== void 0 ? color : undefined);
            return;
        }
        else if (mode === "randy") {
            const botColor = color === Color.Black ? Color.White : Color.Black;
            if (fen)
                yield GameControllerFactory.createLocalVsBotFromFEN(variant, PlayerFactory.createRandyBot(botColor), fen, color !== null && color !== void 0 ? color : undefined);
            else
                yield GameControllerFactory.createLocalVsBot(variant, PlayerFactory.createRandyBot(botColor), color !== null && color !== void 0 ? color : undefined);
            return;
        }
        else if (mode === "stockfish") {
            const botColor = color === Color.Black ? Color.White : Color.Black;
            if (fen)
                yield GameControllerFactory.createLocalVsBotFromFEN(variant, PlayerFactory.createStockfishBot(botColor), fen, color !== null && color !== void 0 ? color : undefined);
            else
                yield GameControllerFactory.createLocalVsBot(variant, PlayerFactory.createStockfishBot(botColor), color !== null && color !== void 0 ? color : undefined);
            return;
        }
        else if (mode === "cesaribot") {
            const botColor = color === Color.Black ? Color.White : Color.Black;
            if (fen)
                yield GameControllerFactory.createLocalVsBotFromFEN(variant, PlayerFactory.createCesariBot(botColor), fen, color !== null && color !== void 0 ? color : undefined);
            else
                yield GameControllerFactory.createLocalVsBot(variant, PlayerFactory.createCesariBot(botColor), color !== null && color !== void 0 ? color : undefined);
            return;
        }
        else if (mode) {
            if (fen)
                yield GameControllerFactory.createLocalVsLocalFromFEN(variant, fen, color !== null && color !== void 0 ? color : undefined);
            else
                yield GameControllerFactory.createLocalVsLocal(variant, color !== null && color !== void 0 ? color : undefined);
            return;
        }
        else {
            abortGameInit();
        }
    });
}
function abortGameInit() {
    console.error("No valid gamemode or savestate provided. Redirecting to homepage");
    window.location.href = "index.html";
}
init();
