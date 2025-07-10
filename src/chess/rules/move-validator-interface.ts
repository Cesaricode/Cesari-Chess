import { Game } from "../game/game.js";
import { Color } from "../types/color.js";
import { Move } from "../types/move.js";
import { Position } from "../types/position.js";

export interface MoveValidator {
    validateMove(game: Game, move: Move): boolean;
    isSquareAttacked(game: Game, pos: Position, byColor: Color): boolean;
}