import { Color } from "../chess/types/color.js";
import { Player } from "./player.js";

export class HumanPlayer extends Player {

    public constructor(name: string, color: Color) {
        super(name, color, false);
    }
}