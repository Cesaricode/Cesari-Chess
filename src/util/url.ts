export function getModeFromUrl() {
    const params: URLSearchParams = new URLSearchParams(window.location.search);
    return params.get("mode") || "self";
}