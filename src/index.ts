import { GameControllerFactory } from "./controller/game-controller-factory.js";

function init(): void {
    GameControllerFactory.createLocalVsLocal();
}

init();