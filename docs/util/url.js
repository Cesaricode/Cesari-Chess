import { Variant } from "../types/variant.js";
export function getModeFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get("mode");
}
export function getColorFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get("color");
}
export function getFENFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get("fen");
}
export function getContinueFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get("continue");
}
export function getVariantFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const variantParam = params.get("variant");
    return (variantParam && variantParam.toLowerCase() === "fischerandom")
        ? Variant.Fischerandom
        : Variant.Standard;
}
