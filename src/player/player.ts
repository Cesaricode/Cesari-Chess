import { Game } from "../chess/game/game.js";
import { Move } from "../chess/types/move.js";

export interface Player {
    name: string;
    isBot: boolean;
    getMove?(game: Game): Promise<Move>;
}