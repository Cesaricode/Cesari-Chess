type ControlHandler = {
    onUndo: () => void;
    onRedo: () => void;
    onHome: () => void;
    onFlip: () => void;
};

export class ControlEventManager {

    private undoBtn: HTMLButtonElement | null;
    private redoBtn: HTMLButtonElement | null;
    private homeBtn: HTMLButtonElement | null;
    private flipBtn: HTMLButtonElement | null;

    public constructor(
        undoBtnId: string = "undoBtn",
        redoBtnId: string = "redoBtn",
        homeBtnId: string = "homeBtn",
        flipBtnId: string = "flipBtn"
    ) {
        this.undoBtn = document.getElementById(undoBtnId) as HTMLButtonElement | null;
        this.redoBtn = document.getElementById(redoBtnId) as HTMLButtonElement | null;
        this.homeBtn = document.getElementById(homeBtnId) as HTMLButtonElement | null;
        this.flipBtn = document.getElementById(flipBtnId) as HTMLButtonElement | null;
    }

    public setupControlEventListeners(handlers: ControlHandler): void {
        if (this.homeBtn) this.homeBtn.onclick = handlers.onHome;
        if (this.undoBtn) this.undoBtn.onclick = handlers.onUndo;
        if (this.redoBtn) this.redoBtn.onclick = handlers.onRedo;
        if (this.flipBtn) this.flipBtn.onclick = handlers.onFlip;
    }

    public updateControlButtons(undoAvailable: boolean, redoAvailable: boolean, gameOngoing: boolean): void {
        if (this.undoBtn) this.undoBtn.disabled = !undoAvailable || !gameOngoing;
        if (this.redoBtn) this.redoBtn.disabled = !redoAvailable || !gameOngoing;
    }
}