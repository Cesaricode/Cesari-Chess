import { Color } from "../chess/types/color.js";

export function parseColor(color: string | null): Color | null {
    if (!color) return null;
    if (color.toLowerCase() === "white") return Color.White;
    if (color.toLowerCase() === "black") return Color.Black;
    return null;
}