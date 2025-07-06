import { FILES } from "../constants/board.js";
import { Move } from "../types/move.js";

export function moveToAlgebraic(move: Move | undefined): string {
    if (!move) return "";
    const fromFile: typeof FILES[number] = FILES[move.from.x];
    const fromRank: number = move.from.y + 1;
    const toFile: typeof FILES[number] = FILES[move.to.x];
    const toRank: number = move.to.y + 1;
    let notation = `${fromFile}${fromRank}${toFile}${toRank}`;
    if (move.promotion) {
        notation += `=${move.promotion.charAt(0).toUpperCase()}`;
    }
    return notation;
}