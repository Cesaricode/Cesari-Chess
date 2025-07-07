export function getModeFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get("mode") || "self";
}
export function getColorFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get("color") || "white";
}
export function getFENFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get("fen") || null;
}
export function getContinueFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get("continue");
}
