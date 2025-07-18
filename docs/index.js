import { FEN } from "./chess/util/fen.js";
function init() {
    document.querySelectorAll(".button").forEach(btn => {
        var _a, _b, _c, _d;
        const opponent = ((_a = btn.textContent) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes("yourself")) ? "self"
            : ((_b = btn.textContent) === null || _b === void 0 ? void 0 : _b.toLowerCase().includes("randy")) ? "randy"
                : ((_c = btn.textContent) === null || _c === void 0 ? void 0 : _c.toLowerCase().includes("stockfish")) ? "stockfish"
                    : ((_d = btn.textContent) === null || _d === void 0 ? void 0 : _d.toLowerCase().includes("cesaribot")) ? "cesaribot"
                        : undefined;
        if (opponent && !btn.disabled) {
            btn.onclick = (e) => {
                e.preventDefault();
                showSetupModal(opponent);
            };
        }
    });
    if (localStorage.getItem("cesariChessSave")) {
        const continueBtn = document.getElementById("continueBtn");
        if (continueBtn) {
            continueBtn.removeAttribute("disabled");
            continueBtn.onclick = () => {
                window.location.href = "game.html?continue=1";
            };
        }
    }
}
function getSetupModalElements() {
    const modal = document.getElementById("setupModal");
    const fenInput = document.getElementById("fenInput");
    const startTypeSelect = document.getElementById("startTypeSelect");
    const colorSelect = document.getElementById("colorSelect");
    const startGameBtn = document.getElementById("startGameBtn");
    const cancelSetupBtn = document.getElementById("cancelSetupBtn");
    const fenError = document.getElementById("fenError");
    if (!modal || !fenInput || !startTypeSelect || !colorSelect || !startGameBtn || !cancelSetupBtn || !fenError) {
        throw new Error("Setup modal initialization failed: One or more required DOM elements are missing.");
    }
    return { modal, fenInput, startTypeSelect, colorSelect, startGameBtn, cancelSetupBtn, fenError };
}
function showSetupModal(opponent) {
    const { modal, fenInput, startTypeSelect, colorSelect, startGameBtn, cancelSetupBtn, fenError } = getSetupModalElements();
    modal.style.display = "block";
    fenInput.style.display = "none";
    startTypeSelect.value = "standard";
    fenInput.value = "";
    startTypeSelect.onchange = function () {
        fenInput.style.display = this.value === "fen" ? "block" : "none";
        fenError.style.display = "none";
        fenInput.value = "";
    };
    cancelSetupBtn.onclick = function () {
        modal.style.display = "none";
    };
    startGameBtn.onclick = function () {
        let color = colorSelect.value;
        let mode = startTypeSelect.value;
        const startType = startTypeSelect.value;
        const fen = fenInput.value.trim();
        if (startType === "fen" && !FEN.isValidFEN(fen)) {
            if (fenError) {
                fenError.textContent = "Invalid FEN string.";
                fenError.style.display = "block";
            }
            return;
        }
        else if (fenError) {
            fenError.style.display = "none";
        }
        if (color === "random") {
            color = Math.random() < 0.5 ? "white" : "black";
        }
        let url = "game.html?mode=" + encodeURIComponent(opponent) + "&color=" + encodeURIComponent(color) + "&variant=" + encodeURIComponent(mode);
        if (startType === "fen" && fen) {
            url += "&fen=" + encodeURIComponent(fen);
        }
        sessionStorage.setItem("startNewGame", "1");
        localStorage.removeItem("cesariChessSave");
        window.location.href = url;
    };
}
init();
