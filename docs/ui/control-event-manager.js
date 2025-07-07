export class ControlEventManager {
    constructor(undoBtnId = "undoBtn", redoBtnId = "redoBtn", homeBtnId = "homeBtn", flipBtnId = "flipBtn") {
        this.undoBtn = document.getElementById(undoBtnId);
        this.redoBtn = document.getElementById(redoBtnId);
        this.homeBtn = document.getElementById(homeBtnId);
        this.flipBtn = document.getElementById(flipBtnId);
    }
    setupControlEventListeners(handlers) {
        if (this.homeBtn)
            this.homeBtn.onclick = handlers.onHome;
        if (this.undoBtn)
            this.undoBtn.onclick = handlers.onUndo;
        if (this.redoBtn)
            this.redoBtn.onclick = handlers.onRedo;
        if (this.flipBtn)
            this.flipBtn.onclick = handlers.onFlip;
    }
    updateControlButtons(undoAvailable, redoAvailable, gameOngoing) {
        if (this.undoBtn)
            this.undoBtn.disabled = !undoAvailable || !gameOngoing;
        if (this.redoBtn)
            this.redoBtn.disabled = !redoAvailable || !gameOngoing;
    }
}
