import { GameFactory } from "../../chess/game/game-factory.js";
import { BaseMoveValidator } from "../../chess/rules/base-move-validator.js";
import { Variant } from "../../types/variant.js";
import { CesariEngine } from "./cesari-engine.js";
let engine = new CesariEngine();
onmessage = function (e) {
    const { fen, options } = e.data;
    const game = GameFactory.fromFEN(fen, new BaseMoveValidator(), Variant.Standard);
    engine.findBestMove(game).then(move => {
        postMessage({ move });
    });
};
