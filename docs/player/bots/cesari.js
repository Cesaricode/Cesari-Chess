var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { BotPlayer } from "../bot-player.js";
import { FEN } from "../../chess/util/fen.js";
export class CesariBot extends BotPlayer {
    constructor(color) {
        super("Cesari", color);
        this._worker = new Worker("../../engine/cesari/cesari-worker.js", { type: "module" });
    }
    getMove(game) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                const fen = FEN.serializeFullFEN(game);
                this._worker.onmessage = (e) => {
                    resolve(e.data.move);
                };
                this._worker.onerror = (err) => {
                    reject(err);
                };
                this._worker.postMessage({ fen });
            });
        });
    }
}
