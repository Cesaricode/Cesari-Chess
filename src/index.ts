import { FEN } from "./chess/util/fen.js";

function init(): void {
    document.querySelectorAll<HTMLButtonElement>(".button").forEach(btn => {
        const opponent = btn.textContent?.toLowerCase().includes("yourself") ? "self"
            : btn.textContent?.toLowerCase().includes("randy") ? "randy"
                : btn.textContent?.toLowerCase().includes("stockfish") ? "stockfish"
                    : btn.textContent?.toLowerCase().includes("cesaribot") ? "cesaribot"
                        : undefined;
        if (opponent && !btn.disabled) {
            btn.onclick = (e) => {
                e.preventDefault();
                showSetupModal(opponent);
            };
        }
    });
    if (localStorage.getItem("cesariChessSave")) {
        const continueBtn: HTMLButtonElement | null = document.getElementById("continueBtn") as HTMLButtonElement | null;
        if (continueBtn) {
            continueBtn.removeAttribute("disabled");
            continueBtn.onclick = () => {
                window.location.href = "game.html?continue=1";
            };
        }
    }
}

function showSetupModal(opponent: string): void {
    const modal: HTMLElement | null = document.getElementById("setupModal");
    const fenInput: HTMLInputElement | null = document.getElementById("fenInput") as HTMLInputElement | null;
    const startTypeSelect: HTMLSelectElement | null = document.getElementById("startTypeSelect") as HTMLSelectElement | null;
    const colorSelect: HTMLSelectElement | null = document.getElementById("colorSelect") as HTMLSelectElement | null;
    const startGameBtn: HTMLButtonElement | null = document.getElementById("startGameBtn") as HTMLButtonElement | null;
    const cancelSetupBtn: HTMLButtonElement | null = document.getElementById("cancelSetupBtn") as HTMLButtonElement | null;
    const fenError: HTMLElement | null = document.getElementById("fenError");

    if (!modal || !fenInput || !startTypeSelect || !colorSelect || !startGameBtn || !cancelSetupBtn || !fenError) return;

    modal.style.display = "block";
    fenInput.style.display = "none";
    startTypeSelect.value = "standard";
    fenInput.value = "";

    startTypeSelect.onchange = function () {
        fenInput.style.display = (this as HTMLSelectElement).value === "fen" ? "block" : "none";
        fenError.style.display = "none";
        fenInput.value = "";
    };

    cancelSetupBtn.onclick = function () {
        modal.style.display = "none";
    };

    startGameBtn.onclick = function () {
        let color: string = colorSelect.value;
        const startType: string = startTypeSelect.value;
        const fen: string = fenInput.value.trim();


        if (startType === "fen" && !FEN.isValidFEN(fen)) {
            if (fenError) {
                fenError.textContent = "Invalid FEN string.";
                fenError.style.display = "block";
            }
            return;
        } else if (fenError) {
            fenError.style.display = "none";
        }

        if (color === "random") {
            color = Math.random() < 0.5 ? "white" : "black";
        }
        let url: string = "game.html?mode=" + encodeURIComponent(opponent) + "&color=" + encodeURIComponent(color);
        if (startType === "fen" && fen) {
            url += "&fen=" + encodeURIComponent(fen);
        }
        sessionStorage.setItem("startNewGame", "1");
        localStorage.removeItem("cesariChessSave");
        window.location.href = url;
    };
}

init();