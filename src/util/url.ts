export function getModeFromUrl() {
    const params: URLSearchParams = new URLSearchParams(window.location.search);
    return params.get("mode") || "self";
}

export function getColorFromUrl(): string {
    const params: URLSearchParams = new URLSearchParams(window.location.search);
    return params.get("color") || "white";
}

export function getFENFromUrl(): string | null {
    const params: URLSearchParams = new URLSearchParams(window.location.search);
    return params.get("fen") || null;
}

export function getContinueFromUrl(): string | null {
    const params: URLSearchParams = new URLSearchParams(window.location.search);
    return params.get("continue");
}