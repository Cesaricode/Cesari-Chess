import { FEN } from "../chess/util/fen.js";
export class GameControlManager {
    constructor() {
        this._resignRestartState = "resign";
        this._resignConfirmTimeout = null;
    }
    setupResignRestartButton(onResign) {
        const btn = document.getElementById("resignRestartBtn");
        if (!btn)
            return;
        btn.onclick = () => {
            btn.classList.remove("button-confirm", "button-restart");
            if (this._resignRestartState === "resign") {
                btn.querySelector(".btn-label").textContent = "Confirm Resign";
                btn.classList.add("button-confirm");
                this._resignRestartState = "confirm";
                if (this._resignConfirmTimeout !== null) {
                    clearTimeout(this._resignConfirmTimeout);
                }
                this._resignConfirmTimeout = window.setTimeout(() => {
                    this.resetResignRestartButton();
                    this._resignConfirmTimeout = null;
                }, 5000);
            }
            else if (this._resignRestartState === "confirm") {
                if (this._resignConfirmTimeout !== null) {
                    clearTimeout(this._resignConfirmTimeout);
                    this._resignConfirmTimeout = null;
                }
                onResign();
                btn.querySelector(".btn-label").textContent = "Restart Game";
                btn.classList.add("button-restart");
                this._resignRestartState = "restart";
            }
            else if (this._resignRestartState === "restart") {
                window.location.reload();
            }
        };
    }
    resetResignRestartButton() {
        const btn = document.getElementById("resignRestartBtn");
        if (!btn)
            return;
        this._resignRestartState = "resign";
        btn.querySelector(".btn-label").textContent = "Resign";
        btn.classList.remove("button-confirm", "button-restart");
        if (this._resignConfirmTimeout !== null) {
            clearTimeout(this._resignConfirmTimeout);
            this._resignConfirmTimeout = null;
        }
    }
    setResignRestartToRestart() {
        const btn = document.getElementById("resignRestartBtn");
        if (!btn)
            return;
        this._resignRestartState = "restart";
        btn.querySelector(".btn-label").textContent = "Restart Game";
        btn.classList.remove("button-confirm");
        btn.classList.add("button-restart");
        if (this._resignConfirmTimeout !== null) {
            clearTimeout(this._resignConfirmTimeout);
            this._resignConfirmTimeout = null;
        }
    }
    setupFenCopyButton(game) {
        const copyFenBtn = document.getElementById("copyFenBtn");
        if (copyFenBtn) {
            copyFenBtn.onclick = () => {
                const fen = FEN.serializeFullFEN(game);
                navigator.clipboard.writeText(fen).then(() => {
                    copyFenBtn.textContent = "Copied!";
                    setTimeout(() => {
                        copyFenBtn.textContent = "Copy FEN";
                    }, 1200);
                });
            };
        }
    }
}
