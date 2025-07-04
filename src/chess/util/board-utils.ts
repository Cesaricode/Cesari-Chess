import { Position } from "../types/position.js";
import { BOARD_WIDTH, BOARD_HEIGHT } from "../constants/board.js";

export function isWithinBoard(pos: Position): boolean {
    return (
        pos.x >= 0 &&
        pos.x < BOARD_WIDTH &&
        pos.y >= 0 &&
        pos.y < BOARD_HEIGHT
    );
}