import { Position } from "../types/position.js";

export function positionToAlgebraic(position: Position): string {
    return String.fromCharCode(97 + position.x) + (position.y + 1);
}