import { Color } from "../chess/types/color.js";
export function parseColor(color) {
    if (!color)
        return null;
    if (color.toLowerCase() === "white")
        return Color.White;
    if (color.toLowerCase() === "black")
        return Color.Black;
    return null;
}
