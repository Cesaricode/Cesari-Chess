export function toAlgebraic(position) {
    return String.fromCharCode(97 + position.x) + (position.y + 1);
}
