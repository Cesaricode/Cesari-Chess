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

    constructor(
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

    private setupHistoryRoster(historyColumnid: string) {
        const roster: HTMLCollectionOf<HTMLElement> | null = document.getElementsByClassName(historyColumnid) as HTMLCollectionOf<HTMLElement> | null;
        if (roster) this._historyRoster = Array.from(roster);
        else this._historyRoster = null;
    }

    public setupControlEventListeners(handlers: HistoryControlHandler): void {
        this._handlers = handlers;
        if (this._goBackBtn) this._goBackBtn.onclick = handlers.onGoBack;
        if (this._goForwardBtn) this._goForwardBtn.onclick = handlers.onGoForward;
        if (this._resetBtn) this._resetBtn.onclick = handlers.onReset;
        this.setupHistoryEventListeners();
    }

    public updateHistoryRoster(): void {
        this.setupHistoryRoster("move-history-index");
        this.setupHistoryEventListeners();
    }

    private setupHistoryEventListeners(): void {
        if (this._historyRoster) {
            this._historyRoster.forEach((element, index) => {
                element.onclick = () => this._handlers?.onGoTo(index + 1);
            });
        }
    }
}