import { BotPlayer } from "../bot-player.js";
import { Game } from "../../chess/game/game.js";
import { Move } from "../../chess/types/move.js";
import { Color } from "../../chess/types/color.js";
import { CesariEngine } from "../../engine/cesari/cesari-engine.js";

export class CesariBot extends BotPlayer {

    private _cesariEngine: CesariEngine = new CesariEngine();

    public constructor(color: Color) {
        super("Cesari", color);
    }

    public async getMove(game: Game): Promise<Move> {
        return this._cesariEngine.findBestMove(game);
    }
}