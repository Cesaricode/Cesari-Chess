import { GameControllerFactory } from "./controller/game-controller-factory.js";
function getModeFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get("mode") || "self";
}
function init() {
    const mode = getModeFromUrl();
    if (mode === "self") {
        GameControllerFactory.createLocalVsLocal();
    }
    else if (mode === "local") {
        GameControllerFactory.createLocalVsLocal();
    }
    else if (mode === "bot") {
        const bot = { name: "Bot", isBot: true };
        GameControllerFactory.createLocalVsBot(bot);
    }
}
init();
