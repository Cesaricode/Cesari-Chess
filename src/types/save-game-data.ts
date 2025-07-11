import { Color } from "../chess/types/color.js";
import { Move } from "../chess/types/move.js";
import { Variant } from "./variant.js";

export interface SaveGameData {
    fen: string;
    initialFen: string;
    moveHistory: Move[];
    localColor: Color;
    botType: string;
    botColor: Color;
    variant: Variant;
}