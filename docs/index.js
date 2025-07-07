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
function showSetupModal(opponent) {
    const modal = document.getElementById("setupModal");
    const fenInput = document.getElementById("fenInput");
    const startTypeSelect = document.getElementById("startTypeSelect");
    const colorSelect = document.getElementById("colorSelect");
    const startGameBtn = document.getElementById("startGameBtn");
    const cancelSetupBtn = document.getElementById("cancelSetupBtn");
    if (!modal || !fenInput || !startTypeSelect || !colorSelect || !startGameBtn || !cancelSetupBtn)
        return;
    modal.style.display = "block";
    fenInput.style.display = "none";
    startTypeSelect.value = "standard";
    fenInput.value = "";
    startTypeSelect.onchange = function () {
        fenInput.style.display = this.value === "fen" ? "block" : "none";
    };
    cancelSetupBtn.onclick = function () {
        modal.style.display = "none";
    };
    startGameBtn.onclick = function () {
        let color = colorSelect.value;
        const startType = startTypeSelect.value;
        const fen = fenInput.value.trim();
        if (color === "random") {
            color = Math.random() < 0.5 ? "white" : "black";
        }
        let url = "game.html?mode=" + encodeURIComponent(opponent) + "&color=" + encodeURIComponent(color);
        if (startType === "fen" && fen) {
            url += "&fen=" + encodeURIComponent(fen);
        }
        window.location.href = url;
    };
}
init();
export {};
