export class HistoryManager {
    constructor(undoStack, redoStack, historyIndex, lastHistoryIndex) {
        this._undoStack = undoStack !== null && undoStack !== void 0 ? undoStack : [];
        this._redoStack = redoStack !== null && redoStack !== void 0 ? redoStack : [];
        this._historyIndex = historyIndex !== null && historyIndex !== void 0 ? historyIndex : null;
        this._lastHistoryIndex = lastHistoryIndex !== null && lastHistoryIndex !== void 0 ? lastHistoryIndex : null;
    }
    // Getters/Setters
    get undoStack() {
        return this._undoStack;
    }
    setUndoStack(undoStack) {
        this._undoStack = undoStack;
    }
    get redoStack() {
        return this._redoStack;
    }
    get historyIndex() {
        return this._historyIndex;
    }
    set historyIndex(index) {
        this._historyIndex = index;
    }
    get lastHistoryIndex() {
        return this._lastHistoryIndex;
    }
    set lastHistoryIndex(index) {
        this._lastHistoryIndex = index;
    }
    // Public Methods
    pushUndo(game) {
        this._undoStack.push(game);
    }
    popUndo() {
        return this._undoStack.pop();
    }
    pushRedo(game) {
        this._redoStack.push(game);
    }
    popRedo() {
        return this._redoStack.pop();
    }
    clearRedo() {
        this._redoStack = [];
    }
    resetHistory() {
        this._historyIndex = null;
        this._lastHistoryIndex = null;
    }
    getGameAtHistoryIndex(index) {
        return this._undoStack[index];
    }
    undo(currentGame, isBotGame, localPlayerColor, remotePlayer) {
        var _a;
        if (this._undoStack.length === 0)
            return null;
        this._redoStack.push(currentGame.clone());
        if (isBotGame && remotePlayer.isBot && localPlayerColor) {
            this._redoStack.push(this._undoStack.pop());
        }
        this._historyIndex = null;
        return (_a = this._undoStack.pop()) !== null && _a !== void 0 ? _a : null;
    }
    redo(currentGame, isBotGame, localPlayerColor, remotePlayer) {
        var _a;
        if (this._redoStack.length === 0)
            return null;
        this._undoStack.push(currentGame.clone());
        if (isBotGame && remotePlayer.isBot && localPlayerColor) {
            this._undoStack.push(this._redoStack.pop());
        }
        this._historyIndex = null;
        return (_a = this._redoStack.pop()) !== null && _a !== void 0 ? _a : null;
    }
    getDisplayGameAndMoveIndex(game) {
        if (this._historyIndex === null) {
            return {
                gameToRender: game,
                activeMoveIndex: game.moveHistory.length - 1
            };
        }
        else {
            const historyGame = this.getGameAtHistoryIndex(this._historyIndex).clone();
            this.addMissingMovesToHistoryGame(game, historyGame);
            const activeMoveIndex = this.calculateActiveMoveIndex(game, historyGame);
            return { gameToRender: historyGame, activeMoveIndex };
        }
    }
    goBackInHistory() {
        if (this._undoStack.length === 0 || this._historyIndex !== null && this._historyIndex <= 0)
            return;
        if (this._historyIndex === null) {
            this._historyIndex = this._undoStack.length - 1;
        }
        else {
            this._historyIndex = this._historyIndex - 1;
        }
    }
    goForwardInHistory() {
        if (this._undoStack.length === 0)
            return;
        if (this._historyIndex === null) {
            return;
        }
        else if (this._historyIndex === this._undoStack.length - 1) {
            this._historyIndex = null;
        }
        else {
            this._historyIndex = this._historyIndex + 1;
        }
    }
    goToHistoryIndex(index) {
        if (this._undoStack.length === 0 || index < 0 || index > this._undoStack.length)
            return;
        if (index === this._undoStack.length) {
            this._historyIndex = null;
        }
        else {
            this._historyIndex = index;
        }
    }
    // Helpers
    addMissingMovesToHistoryGame(currentGame, historyGame) {
        const start = historyGame.moveHistory.length;
        const missingMoves = currentGame.moveHistory.slice(start);
        for (const move of missingMoves) {
            historyGame.addToMoveHistory(move);
        }
    }
    calculateActiveMoveIndex(currentGame, historyGame) {
        var _a;
        return historyGame.moveHistory.length - (currentGame.moveHistory.length - ((_a = this._historyIndex) !== null && _a !== void 0 ? _a : 0)) - 1;
    }
}
