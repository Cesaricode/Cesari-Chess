export class HistoryEventManager {
    constructor(goBackBtnid = "moveHistoryBackBtn", goForwardBtnid = "moveHistoryForwardBtn", resetBtnid = "moveHistoryToCurrentBtn", historyColumnid = "move-history-index") {
        this._goBackBtn = document.getElementById(goBackBtnid);
        this._goForwardBtn = document.getElementById(goForwardBtnid);
        this._resetBtn = document.getElementById(resetBtnid);
        this.setupHistoryRoster(historyColumnid);
    }
    setupHistoryRoster(historyColumnid) {
        const roster = document.getElementsByClassName(historyColumnid);
        if (roster)
            this._historyRoster = Array.from(roster);
        else
            this._historyRoster = null;
    }
    setupControlEventListeners(handlers) {
        this._handlers = handlers;
        if (this._goBackBtn)
            this._goBackBtn.onclick = handlers.onGoBack;
        if (this._goForwardBtn)
            this._goForwardBtn.onclick = handlers.onGoForward;
        if (this._resetBtn)
            this._resetBtn.onclick = handlers.onReset;
        this.setupHistoryEventListeners();
    }
    updateHistoryRoster() {
        this.setupHistoryRoster("move-history-index");
        this.setupHistoryEventListeners();
    }
    setupHistoryEventListeners() {
        if (this._historyRoster) {
            this._historyRoster.forEach((element, index) => {
                element.onclick = () => { var _a; return (_a = this._handlers) === null || _a === void 0 ? void 0 : _a.onGoTo(index + 1); };
            });
        }
    }
}
