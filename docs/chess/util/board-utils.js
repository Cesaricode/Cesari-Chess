import { BOARD_WIDTH, BOARD_HEIGHT } from "../constants/board.js";
export function isWithinBoard(pos) {
    return (pos.x >= 0 &&
        pos.x < BOARD_WIDTH &&
        pos.y >= 0 &&
        pos.y < BOARD_HEIGHT);
}
