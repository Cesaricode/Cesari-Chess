import { FILES } from "../constants/board.js";
export function moveToAlgebraic(move) {
    if (!move)
        return "";
    const fromFile = FILES[move.from.x];
    const fromRank = move.from.y + 1;
    const toFile = FILES[move.to.x];
    const toRank = move.to.y + 1;
    let notation = `${fromFile}${fromRank}${toFile}${toRank}`;
    if (move.promotion) {
        notation += `=${move.promotion.charAt(0).toUpperCase()}`;
    }
    return notation;
}
