export class HistoryEventManager {
    constructor(goBackBtnid = "moveHistoryBackBtn", goForwardBtnid = "moveHistoryForwardBtn", resetBtnid = "moveHistoryToCurrentBtn", historyColumnid = "move-history-index") {
        this._goBackBtn = document.getElementById(goBackBtnid);
        this._goForwardBtn = document.getElementById(goForwardBtnid);
        this._resetBtn = document.getElementById(resetBtnid);
        this.setupHistoryRoster(historyColumnid);
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
    setupHistoryRoster(historyColumnid) {
        const roster = document.getElementsByClassName(historyColumnid);
        if (roster)
            this._historyRoster = Array.from(roster);
        else
            this._historyRoster = null;
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
        let longPress = false;
        let touchInProgress = false;
        const start = (e) => {
            if (touchInProgress)
                return;
            action();
            timeout = window.setTimeout(() => {
                longPress = true;
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
            longPress = false;
        };
        btn.onmousedown = start;
        btn.onmouseup = stop;
        btn.onmouseleave = stop;
        btn.onmouseout = stop;
        btn.onblur = stop;
        btn.oncontextmenu = stop;
        btn.ontouchstart = (e) => {
            e.preventDefault();
            touchInProgress = true;
            longPress = false;
            timeout = window.setTimeout(() => {
                longPress = true;
                interval = window.setInterval(action, 60);
            }, 400);
        };
        btn.ontouchend = (e) => {
            e.preventDefault();
            if (!longPress)
                action();
            stop();
            setTimeout(() => { touchInProgress = false; }, 100);
        };
        btn.ontouchcancel = (e) => {
            e.preventDefault();
            stop();
            setTimeout(() => { touchInProgress = false; }, 100);
        };
    }
}
