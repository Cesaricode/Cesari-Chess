export function getModeFromUrl(): string | null {
    const params: URLSearchParams = new URLSearchParams(window.location.search);
    return params.get("mode");
}

export function getColorFromUrl(): string | null {
    const params: URLSearchParams = new URLSearchParams(window.location.search);
    return params.get("color");
}

export function getFENFromUrl(): string | null {
    const params: URLSearchParams = new URLSearchParams(window.location.search);
    return params.get("fen");
}

export function getContinueFromUrl(): string | null {
    const params: URLSearchParams = new URLSearchParams(window.location.search);
    return params.get("continue");
}