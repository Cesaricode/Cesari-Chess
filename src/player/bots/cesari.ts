import { BotPlayer } from "../bot-player.js";
import { Game } from "../../chess/game/game.js";
import { Move } from "../../chess/types/move.js";
import { Color } from "../../chess/types/color.js";
import { FEN } from "../../chess/util/fen.js";

export class CesariBot extends BotPlayer {

    private _worker: Worker;

    public constructor(color: Color) {
        super("Cesari", color);
        this._worker = new Worker("../../engine/cesari/cesari-worker.js", { type: "module" });
    }

    public async getMove(game: Game): Promise<Move> {
        return new Promise<Move>((resolve, reject) => {
            const fen: string = FEN.serializeFullFEN(game);
            this._worker.onmessage = (e) => {
                resolve(e.data.move);
            };
            this._worker.onerror = (err) => {
                reject(err);
            };
            this._worker.postMessage({ fen });
        });
    }
}