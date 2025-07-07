import { Position } from "../types/position.js";
import { BOARD_WIDTH, BOARD_HEIGHT } from "../constants/board.js";
import { Board } from "../board/board.js";

export function isWithinBoard(pos: Position): boolean {
    return (
        pos.x >= 0 &&
        pos.x < BOARD_WIDTH &&
        pos.y >= 0 &&
        pos.y < BOARD_HEIGHT
    );
}

export function printBoard(board: Board): void {
    const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"];
    let output = "";
    for (let y = 7; y >= 0; y--) {
        let row = "";
        for (let x = 0; x < 8; x++) {
            const piece = board.getPieceAt({ x, y });
            if (piece) {
                const symbol = piece.type.charAt(0);
                row += piece.color === "white" ? symbol.toUpperCase() : symbol.toLowerCase();
            } else {
                row += ".";
            }
            row += " ";
        }
        output += (y + 1) + " " + row + "\n";
    }
    output += "  " + FILES.join(" ") + "\n";
    console.log(output);
}