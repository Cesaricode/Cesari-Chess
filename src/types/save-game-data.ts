import { Color } from "../chess/types/color.js";
import { Move } from "../chess/types/move.js";

export interface SaveGameData {
    fen: string;
    moveHistory: Move[];
    localColor: Color;
    botType: string;
    botColor: Color;
}