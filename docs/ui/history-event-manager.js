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
    setupHistoryEventListeners(handlers) {
        this._handlers = handlers;
        if (this._goBackBtn) {
            this.setupHoldableButton(this._goBackBtn, handlers.onGoBack);
        }
        if (this._goForwardBtn) {
            this.setupHoldableButton(this._goForwardBtn, handlers.onGoForward);
        }
        if (this._resetBtn)
            this._resetBtn.onclick = handlers.onReset;
        this.applyHistoryEventListeners();
    }
    updateHistoryRoster() {
        this.setupHistoryRoster("move-history-index");
        this.applyHistoryEventListeners();
    }
    applyHistoryEventListeners() {
        if (this._historyRoster) {
            this._historyRoster.forEach((element, index) => {
                element.onclick = () => { var _a; return (_a = this._handlers) === null || _a === void 0 ? void 0 : _a.onGoTo(index + 1); };
            });
        }
    }
    setupHoldableButton(btn, action) {
        let interval;
        let timeout;
        const start = () => {
            action();
            timeout = window.setTimeout(() => {
                interval = window.setInterval(action, 60);
            }, 400);
        };
        const stop = () => {
            if (timeout !== undefined)
                clearTimeout(timeout);
            if (interval !== undefined)
                clearInterval(interval);
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
