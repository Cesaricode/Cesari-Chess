import { Game } from "../chess/game/game.js";
import { Move } from "../chess/types/move.js";

export class HistoryManager {
    private _undoStack: Game[];
    private _redoStack: Game[];
    private _historyIndex: number | null;
    private _lastHistoryIndex: number | null;

    public constructor(
        undoStack?: Game[],
        redoStack?: Game[],
        historyIndex?: number | null,
        lastHistoryIndex?: number | null
    ) {
        this._undoStack = undoStack ?? [];
        this._redoStack = redoStack ?? [];
        this._historyIndex = historyIndex ?? null;
        this._lastHistoryIndex = lastHistoryIndex ?? null;
    }

    public get undoStack(): Game[] {
        return this._undoStack;
    }

    public setUndoStack(undoStack: Game[]): void {
        this._undoStack = undoStack;
    }

    public get redoStack(): Game[] {
        return this._redoStack;
    }

    public get historyIndex(): number | null {
        return this._historyIndex;
    }

    public set historyIndex(index: number | null) {
        this._historyIndex = index;
    }

    public get lastHistoryIndex(): number | null {
        return this._lastHistoryIndex;
    }

    public set lastHistoryIndex(index: number | null) {
        this._lastHistoryIndex = index;
    }

    public pushUndo(game: Game): void {
        this._undoStack.push(game);
    }

    public popUndo(): Game | undefined {
        return this._undoStack.pop();
    }

    public pushRedo(game: Game): void {
        this._redoStack.push(game);
    }

    public popRedo(): Game | undefined {
        return this._redoStack.pop();
    }

    public clearRedo(): void {
        this._redoStack = [];
    }

    public resetHistory(): void {
        this._historyIndex = null;
        this._lastHistoryIndex = null;
    }

    public getGameAtHistoryIndex(index: number): Game {
        return this._undoStack[index];
    }

    public undo(currentGame: Game, isBotGame: boolean, localPlayerColor: string, remotePlayer: { isBot: boolean; }): Game | null {
        if (this._undoStack.length === 0) return null;
        this._redoStack.push(currentGame.clone());
        if (isBotGame && remotePlayer.isBot && localPlayerColor) {
            this._redoStack.push(this._undoStack.pop()!);
        }
        this._historyIndex = null;
        return this._undoStack.pop() ?? null;
    }

    public redo(currentGame: Game, isBotGame: boolean, localPlayerColor: string, remotePlayer: { isBot: boolean; }): Game | null {
        if (this._redoStack.length === 0) return null;
        this._undoStack.push(currentGame.clone());
        if (isBotGame && remotePlayer.isBot && localPlayerColor) {
            this._undoStack.push(this._redoStack.pop()!);
        }
        this._historyIndex = null;
        return this._redoStack.pop() ?? null;
    }

    public getDisplayGameAndMoveIndex(game: Game): { gameToRender: Game, activeMoveIndex: number | null; } {
        if (this._historyIndex === null) {
            return {
                gameToRender: game,
                activeMoveIndex: game.moveHistory.length - 1
            };
        } else {
            const historyGame: Game = this.getGameAtHistoryIndex(this._historyIndex).clone();
            this.addMissingMovesToHistoryGame(game, historyGame);
            const activeMoveIndex: number = this.calculateActiveMoveIndex(game, historyGame);
            return { gameToRender: historyGame, activeMoveIndex };
        }
    }

    private addMissingMovesToHistoryGame(currentGame: Game, historyGame: Game): void {
        const start: number = historyGame.moveHistory.length;
        const missingMoves: Move[] = currentGame.moveHistory.slice(start);
        for (const move of missingMoves) {
            historyGame.addToMoveHistory(move);
        }
    }

    private calculateActiveMoveIndex(currentGame: Game, historyGame: Game): number {
        return historyGame.moveHistory.length - (currentGame.moveHistory.length - (this._historyIndex ?? 0)) - 1;
    }

    public goBackInHistory(): void {
        if (this._undoStack.length === 0 || this._historyIndex !== null && this._historyIndex <= 0) return;

        if (this._historyIndex === null) {
            this._historyIndex = this._undoStack.length - 1;
        }
        else {
            this._historyIndex = this._historyIndex - 1;
        }
    }

    public goForwardInHistory(): void {
        if (this._undoStack.length === 0) return;

        if (this._historyIndex === null) {
            return;
        } else if (this._historyIndex === this._undoStack.length - 1) {
            this._historyIndex = null;
        } else {
            this._historyIndex = this._historyIndex + 1;
        }
    }

    public goToHistoryIndex(index: number): void {
        if (this._undoStack.length === 0 || index < 0 || index > this._undoStack.length) return;
        if (index === this._undoStack.length) {
            this._historyIndex = null;
        } else {
            this._historyIndex = index;
        }
    }
}