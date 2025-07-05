export function getModeFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get("mode") || "self";
}
