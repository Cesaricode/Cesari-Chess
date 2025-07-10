import { Game } from "../chess/game/game.js";
import { Color } from "../chess/types/color.js";
import { Move } from "../chess/types/move.js";
import { Player } from "./player.js";

export abstract class BotPlayer extends Player {

    public constructor(name: string, color: Color) {
        super(name, color, true);
    }

    public abstract getMove(game: Game): Promise<Move>;
}