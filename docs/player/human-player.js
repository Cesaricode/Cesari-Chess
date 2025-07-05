import { Player } from "./player.js";
export class HumanPlayer extends Player {
    constructor(name, color) {
        super(name, color, false);
    }
}
