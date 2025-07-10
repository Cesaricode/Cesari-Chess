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
