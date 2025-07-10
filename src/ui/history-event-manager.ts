type HistoryControlHandler = {
    onGoBack: () => void;
    onGoForward: () => void;
    onReset: () => void;
    onGoTo: (index: number) => void;
};

export class HistoryEventManager {

    private _goBackBtn: HTMLButtonElement | null;
    private _goForwardBtn: HTMLButtonElement | null;
    private _resetBtn: HTMLButtonElement | null;
    private _historyRoster!: HTMLElement[] | null;
    private _handlers?: HistoryControlHandler;

    public constructor(
        goBackBtnid: string = "moveHistoryBackBtn",
        goForwardBtnid: string = "moveHistoryForwardBtn",
        resetBtnid: string = "moveHistoryToCurrentBtn",
        historyColumnid: string = "move-history-index"
    ) {
        this._goBackBtn = document.getElementById(goBackBtnid) as HTMLButtonElement | null;
        this._goForwardBtn = document.getElementById(goForwardBtnid) as HTMLButtonElement | null;
        this._resetBtn = document.getElementById(resetBtnid) as HTMLButtonElement | null;
        this.setupHistoryRoster(historyColumnid);
    }

    public setupHistoryEventListeners(handlers: HistoryControlHandler): void {
        this._handlers = handlers;
        if (this._goBackBtn) {
            this.setupHoldableButton(this._goBackBtn, handlers.onGoBack);
        }
        if (this._goForwardBtn) {
            this.setupHoldableButton(this._goForwardBtn, handlers.onGoForward);
        }
        if (this._resetBtn) this._resetBtn.onclick = handlers.onReset;
        this.applyHistoryEventListeners();
    }

    public updateHistoryRoster(): void {
        this.setupHistoryRoster("move-history-index");
        this.applyHistoryEventListeners();
    }

    private setupHistoryRoster(historyColumnid: string) {
        const roster: HTMLCollectionOf<HTMLElement> | null = document.getElementsByClassName(historyColumnid) as HTMLCollectionOf<HTMLElement> | null;
        if (roster) this._historyRoster = Array.from(roster);
        else this._historyRoster = null;
    }

    private applyHistoryEventListeners(): void {
        if (this._historyRoster) {
            this._historyRoster.forEach((element, index) => {
                element.onclick = () => this._handlers?.onGoTo(index + 1);
            });
        }
    }

    private setupHoldableButton(btn: HTMLButtonElement, action: () => void) {
        let interval: number | undefined;
        let timeout: number | undefined;

        const start = () => {
            action();
            timeout = window.setTimeout(() => {
                interval = window.setInterval(action, 60);
            }, 400);
        };

        const stop = () => {
            if (timeout !== undefined) clearTimeout(timeout);
            if (interval !== undefined) clearInterval(interval);
            timeout = undefined;
            interval = undefined;
        };

        btn.onmousedown = start;
        btn.onmouseup = stop;
        btn.onmouseleave = stop;
        btn.onmouseout = stop;
        btn.ontouchstart = start;
        btn.ontouchend = stop;
        btn.ontouchcancel = stop;
        btn.onblur = stop;
        btn.oncontextmenu = stop;
    }
}