import { BotPlayer } from "../bot-player.js";
import { Game } from "../../chess/game/game.js";
import { Move } from "../../chess/types/move.js";
import { Color } from "../../chess/types/color.js";
import { getRandomLegalMove } from "../../chess/util/random-move.js";

export class RandyBot extends BotPlayer {
    constructor(color: Color) {
        super("Randy", color);
    }

    async getMove(game: Game): Promise<Move> {
        await new Promise(resolve => setTimeout(resolve, 400));
        return getRandomLegalMove(game);
    }
}