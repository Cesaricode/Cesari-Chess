import { FILES, RANKS } from "../chess/constants/board.js";
import { GameFactory } from "../chess/game/game-factory.js";
import { Game } from "../chess/game/game.js";
import { Piece } from "../chess/pieces/piece.js";
import { MoveValidator } from "../chess/rules/move-validator.js";
import { Color } from "../chess/types/color.js";
import { Move } from "../chess/types/move.js";
import { Position } from "../chess/types/position.js";
import { PromotionPieceType } from "../chess/types/promotion-piece-type.js";
import { BotPlayer } from "../player/bot-player.js";
import { Player } from "../player/player.js";
import { BoardEventManager } from "../ui/board-event-manager.js";
import { UiRenderer } from "../ui/ui-renderer.js";
import { ControlEventManager } from "../ui/control-event-manager.js";
import { HistoryEventManager } from "../ui/history-event-manager.js";
import { FEN } from "../chess/util/fen.js";
import { SaveGameData } from "../types/save-game-data.js";
import { SoundManager } from "../sounds/sound-manager.js";

export class GameController {

    private _game: Game;
    private _ui: UiRenderer;
    private _boardEventManager: BoardEventManager = new BoardEventManager();
    private _controlEventManager: ControlEventManager = new ControlEventManager();
    private _historyEventManager: HistoryEventManager = new HistoryEventManager();
    private _soundManager: SoundManager = new SoundManager();

    private _localPlayer: Player;
    private _remotePlayer: Player;

    private _undoStack: Game[] = [];
    private _redoStack: Game[] = [];

    private _historyIndex: number | null = null;
    private _lastHistoryIndex: number | null = null;

    private _selectedSquare: Position | null = null;
    private _isBoardEnabled: boolean = true;
    private _isBoardFlipped: boolean = false;

    private _resignRestartState: "resign" | "confirm" | "restart" = "resign";
    private _resignConfirmTimeout: number | null = null;

    public constructor(localPlayer: Player, remotePlayer: Player, game?: Game) {
        this._localPlayer = localPlayer;
        this._remotePlayer = remotePlayer;
        this._ui = new UiRenderer();
        this._game = game ?? GameFactory.fromStartingPosition();
    }

    public async init(): Promise<void> {
        this.renderAppropriateGameState();
        const whitePlayer: Player = this._localPlayer.color === Color.White ? this._localPlayer : this._remotePlayer;
        const blackPlayer: Player = this._localPlayer.color === Color.Black ? this._localPlayer : this._remotePlayer;
        this._ui.renderPlayerNames(whitePlayer.name, blackPlayer.name);
        this.setupEventListeners();
        this.setupResignRestartButton();
        if (this._localPlayer.color === Color.Black) {
            this.setBoardFlipped(true);
        }
        if (this._game.activeColor !== this._localPlayer.color) {
            await this.tryBotMove();
        }
        this._ui.renderStatus(this._game.status, this._game.activeColor);
    }

    private setupEventListeners(): void {
        this._boardEventManager.setupBoardEventListeners(async (file, rank) => {
            if (!this._isBoardEnabled) return;
            await this.handleSquareClick(file, rank);
        });
        this._controlEventManager.setupControlEventListeners({
            onUndo: () => this.undo(),
            onRedo: () => this.redo(),
            onHome: () => window.location.href = "index.html",
            onFlip: () => this.setBoardFlipped(!this._isBoardFlipped)
        });
        this._historyEventManager.setupHistoryEventListeners({
            onGoBack: () => this.goBackInHistory(),
            onGoForward: () => this.goForwardInHistory(),
            onReset: () => this.resetHistoryView(),
            onGoTo: (index: number) => this.goToHistoryIndex(index)
        });
    }

    private async handleSquareClick(file: typeof FILES[number], rank: typeof RANKS[number]): Promise<void> {
        const pos: Position = { x: FILES.indexOf(file), y: rank - 1 };

        if (!this._selectedSquare) {
            this.handleFirstSquareClick(pos, file, rank);
        } else {
            await this.handleSecondSquareClick(pos);
        }
        this.resetHistoryView();

        if (this._game.status !== "ongoing") {
            this._boardEventManager.removeBoardEventListeners();
        }

        if (!this._soundManager.userHasInteracted) {
            this._soundManager.userHasInteracted = true;
        }
    }

    private handleFirstSquareClick(pos: Position, file: typeof FILES[number], rank: typeof RANKS[number]): void {
        this._selectedSquare = pos;
        this._ui.resetHighlights();

        const piece: Piece | null = this._game.board.getPieceAt(pos);
        if (piece && piece.color === this._game.activeColor) {
            this.highlightLegalMoves(piece, pos);
            this._ui.selectSquare(`${file}${rank}`);
        } else {
            this._selectedSquare = null;
        }
    }

    private async handleSecondSquareClick(to: Position): Promise<void> {
        const from: Position = this._selectedSquare!;
        const fromPiece: Piece | null = this._game.board.getPieceAt(from);
        const toPiece: Piece | null = this._game.board.getPieceAt(to);

        this._ui.resetHighlights();

        if (this.isSelectingSamePiece(fromPiece, toPiece)) {
            this._ui.resetSelectHighlights();
            this._selectedSquare = null;
        }

        if (this.isSelectingOwnPieceAgain(fromPiece, toPiece)) {
            this.selectNewPiece(toPiece!, to);
            return;
        }

        if (fromPiece !== null && this._historyIndex === null) {
            const move: Move = this.buildMoveObject(fromPiece, from, to);
            await this.attemptMove(move);
            this._ui.resetSelectHighlights();
        }
        this._selectedSquare = null;
    }

    private isSelectingSamePiece(fromPiece: Piece | null, toPiece: Piece | null): boolean {
        return fromPiece === toPiece;
    }

    private isSelectingOwnPieceAgain(fromPiece: Piece | null, toPiece: Piece | null): boolean {
        return Boolean(
            toPiece &&
            fromPiece &&
            toPiece !== fromPiece &&
            toPiece.color === fromPiece.color &&
            toPiece.color === this._game.activeColor
        );
    }

    private selectNewPiece(piece: Piece, pos: Position): void {
        this._selectedSquare = pos;
        this._ui.resetHighlights();
        this.highlightLegalMoves(piece, pos);
        const targetFile: string = FILES[pos.x];
        const targetRank: number = pos.y + 1;
        this._ui.selectSquare(`${targetFile}${targetRank}`);
    }

    private getPromotionChoice(): PromotionPieceType | undefined {
        const promoteSelect: HTMLSelectElement | null = document.getElementById("promote") as HTMLSelectElement | null;
        if (promoteSelect) {
            return promoteSelect.value as PromotionPieceType;
        }
        return undefined;
    }

    private buildMoveObject(fromPiece: Piece, from: Position, to: Position): Move {
        const color: Color = fromPiece.color;
        let promotion: PromotionPieceType | undefined = undefined;
        if (
            fromPiece.type === "pawn" &&
            ((color === "white" && to.y === 7) || (color === "black" && to.y === 0))
        ) {
            promotion = this.getPromotionChoice();
        }
        return { from, to, piece: fromPiece.type, color, ...(promotion ? { promotion } : {}) };
    }

    private async attemptMove(move: Move): Promise<void> {
        const targetPiece: Piece | null = this._game.board.getPieceAt(move.to);
        const gameClone: Game = this._game.clone();
        if (this._game.makeMove(move)) {
            this._undoStack.push(gameClone);
            this.handleSuccesfulMove(move, targetPiece);
        }
    }

    private async handleSuccesfulMove(move: Move, targetPiece: Piece | null): Promise<void> {
        this._redoStack = [];
        this._selectedSquare = null;
        this._ui.resetHighlights();
        this._ui.resetSelectHighlights();
        this.renderAppropriateGameState();
        this.highlightLastMove();
        this.updateControlButtons();
        this._ui.renderStatus(this._game.status, this._game.activeColor);
        this.resetResignRestartButton();

        if (this._game.status !== "ongoing") {
            this._soundManager.playGenericNotifySound();
            this.setResignRestartToRestart();
        } else if (targetPiece && targetPiece.color !== move.color) {
            this._soundManager.playCaptureSound();
        } else {
            this._soundManager.playMoveSound();
        }


        this.updateSaveGameState();
        await this.tryBotMove();
    }

    private updateSaveGameState() {
        if (this._game.status === "ongoing") {
            this.saveGameState();
        } else {
            localStorage.removeItem("cesariChessSave");
        }
    }

    private async tryBotMove(): Promise<void> {
        if (this._game.status === "ongoing") {
            const currentPlayer: Player = this._game.activeColor === this._localPlayer.color ? this._localPlayer : this._remotePlayer;
            if (currentPlayer.isBot && typeof (currentPlayer as BotPlayer).getMove === "function") {
                this.disableBoard();
                const move: Move = await (currentPlayer as BotPlayer).getMove(this._game);
                await this.attemptMove(move);
                this.enableBoard();
            }
        }
    }

    private highlightLegalMoves(piece: Piece, from: Position): void {
        const pseudoLegalMoves: Position[] = piece.getPseudoLegalMoves();
        for (const movePos of pseudoLegalMoves) {
            const move: Move = {
                from,
                to: movePos,
                piece: piece.type,
                color: piece.color
            };
            if (!MoveValidator.validateMove(this._game, move)) continue;
            const targetFile: string = FILES[movePos.x];
            const targetRank: number = movePos.y + 1;
            const targetPiece: Piece | null = this._game.board.getPieceAt(movePos);
            if (targetPiece && targetPiece.color !== piece.color) {
                this._ui.highlightSquare(`${targetFile}${targetRank}`, "targethighlighted");
            } else {
                this._ui.highlightSquare(`${targetFile}${targetRank}`);
            }
        }

        this.higlightLegalCastlingMoves(piece, from);
    }

    private higlightLegalCastlingMoves(piece: Piece, from: Position): void {
        if (piece.type === "king") {
            const castlingTargets: Position[] = [];
            if (piece.color === "white" && from.x === 4 && from.y === 0) {
                castlingTargets.push({ x: 6, y: 0 });
                castlingTargets.push({ x: 2, y: 0 });
            }
            if (piece.color === "black" && from.x === 4 && from.y === 7) {
                castlingTargets.push({ x: 6, y: 7 });
                castlingTargets.push({ x: 2, y: 7 });
            }
            for (const castlePos of castlingTargets) {
                const move: Move = {
                    from,
                    to: castlePos,
                    piece: piece.type,
                    color: piece.color
                };
                if (MoveValidator.validateMove(this._game, move)) {
                    const targetFile: string = FILES[castlePos.x];
                    const targetRank: number = castlePos.y + 1;
                    this._ui.highlightSquare(`${targetFile}${targetRank}`);
                }
            }
        }
    }

    private highlightLastMove(): void {
        const lastMove: Move | null = this._game.moveHistory.length > 0
            ? this._game.moveHistory[this._game.moveHistory.length - 1]
            : null;
        if (!lastMove) {
            this._ui.resetLastMoveHighlights();
            return;
        }
        const fromFile = FILES[lastMove.from.x];
        const fromRank = lastMove.from.y + 1;
        const toFile = FILES[lastMove.to.x];
        const toRank = lastMove.to.y + 1;
        this._ui.highlightLastMove(`${fromFile}${fromRank}`, `${toFile}${toRank}`);
    }

    public undo(): void {
        if (this._undoStack.length === 0) return;
        this._redoStack.push(this._game.clone());
        if (this._remotePlayer.isBot && this._game.activeColor === this._localPlayer.color) {
            this._redoStack.push(this._undoStack.pop()!);
        }
        this._historyIndex = null;
        this._game = this._undoStack.pop()!;
        this._ui.resetHighlights();
        this._ui.resetSelectHighlights();
        this.renderAppropriateGameState();
        this.highlightLastMove();
        this.updateControlButtons();
    }


    public redo(): void {
        if (this._redoStack.length === 0) return;
        this._undoStack.push(this._game.clone());
        if (this._remotePlayer.isBot && this._game.activeColor === this._localPlayer.color) {
            this._undoStack.push(this._redoStack.pop()!);
        }
        this._historyIndex = null;
        this._game = this._redoStack.pop()!;
        this._ui.resetHighlights();
        this._ui.resetSelectHighlights();
        this.renderAppropriateGameState();
        this.highlightLastMove();
        this.updateControlButtons();
    }

    private enableBoard(): void {
        this._isBoardEnabled = true;
    }

    private disableBoard(): void {
        this._isBoardEnabled = false;
    }

    public updateControlButtons(): void {
        this._controlEventManager.updateControlButtons(
            this._undoStack.length > 0,
            this._redoStack.length > 0,
            this._game.status === "ongoing"
        );
    }

    private renderAppropriateGameState(): void {
        if ((this._lastHistoryIndex === null && this._historyIndex !== null) ||
            (this._lastHistoryIndex !== null && this._historyIndex === null)) {
            this._ui.resetHighlights();
            this._ui.resetSelectHighlights();
        }
        this._lastHistoryIndex = this._historyIndex;

        const { gameToRender, activeMoveIndex } = this.getDisplayGameAndMoveIndex();
        this._ui.render(gameToRender, activeMoveIndex);
        this.highlightHistoryMove(gameToRender, activeMoveIndex);
        this._historyEventManager.updateHistoryRoster();
    }

    private getDisplayGameAndMoveIndex(): { gameToRender: Game, activeMoveIndex: number | null; } {
        if (this._historyIndex === null) {
            return {
                gameToRender: this._game,
                activeMoveIndex: this._game.moveHistory.length - 1
            };
        } else {
            const historyGame: Game = this.getGameAtHistoryIndex(this._historyIndex).clone();
            this.addMissingMovesToHistoryGame(historyGame);
            const activeMoveIndex: number = this.calculateActiveMoveIndex(historyGame);
            return { gameToRender: historyGame, activeMoveIndex };
        }
    }

    private addMissingMovesToHistoryGame(historyGame: Game): void {
        const start: number = historyGame.moveHistory.length;
        const missingMoves: Move[] = this._game.moveHistory.slice(start);
        for (const move of missingMoves) {
            historyGame.addToMoveHistory(move);
        }
    }

    private calculateActiveMoveIndex(historyGame: Game): number {
        return historyGame.moveHistory.length - (this._game.moveHistory.length - (this._historyIndex ?? 0)) - 1;
    }

    private highlightHistoryMove(game: Game, moveIndex: number | null): void {
        if (moveIndex !== null && moveIndex >= 0 && moveIndex < game.moveHistory.length) {
            const move: Move = game.moveHistory[moveIndex];
            this._ui.highlightLastMove(
                FILES[move.from.x] + (move.from.y + 1),
                FILES[move.to.x] + (move.to.y + 1)
            );
        } else {
            this._ui.resetLastMoveHighlights();
        }
    }

    private getGameAtHistoryIndex(historyIndex: number): Game {
        return this._undoStack[historyIndex];
    }

    private goBackInHistory(): void {
        this._selectedSquare = null;
        if (this._undoStack.length === 0 || this._historyIndex !== null && this._historyIndex <= 0) return;

        if (this._historyIndex === null) {
            this._historyIndex = this._undoStack.length - 1;
        }
        else {
            this._historyIndex = this._historyIndex - 1;
        }
        this.renderAppropriateGameState();
    }

    private goForwardInHistory(): void {
        this._selectedSquare = null;
        if (this._undoStack.length === 0) return;

        if (this._historyIndex === null) {
            return;
        } else if (this._historyIndex === this._undoStack.length - 1) {
            this._historyIndex = null;
        } else {
            this._historyIndex = this._historyIndex + 1;
        }
        this.renderAppropriateGameState();
    }

    private goToHistoryIndex(index: number): void {
        this._selectedSquare = null;
        if (this._undoStack.length === 0 || index < 0 || index > this._undoStack.length) return;
        if (index === this._undoStack.length) {
            this._historyIndex = null;
        } else {
            this._historyIndex = index;
        }
        this.renderAppropriateGameState();
    }

    private resetHistoryView(): void {
        this._historyIndex = null;
        this.renderAppropriateGameState();
    }

    private setBoardFlipped(flipped: boolean): void {
        this._isBoardFlipped = flipped;
        const boardContainer: HTMLElement | null = document.getElementById("chessBoardContainer");
        if (boardContainer) {
            boardContainer.classList.toggle("flipped", this._isBoardFlipped);
        }
        this.renderAppropriateGameState();
    }

    private saveGameState(): void {
        if (!this._remotePlayer.isBot) return;

        const saveData: SaveGameData = {
            fen: FEN.serializeFullFEN(this._game),
            initialFen: this._game.initialFEN,
            moveHistory: this._game.moveHistory,
            localColor: this._localPlayer.color,
            botType: this._remotePlayer.name,
            botColor: this._remotePlayer.color,
        };
        localStorage.setItem("cesariChessSave", JSON.stringify(saveData));
    }

    public setUndoStack(stack: Game[]): void {
        this._undoStack = stack;
    }

    private setupResignRestartButton(): void {
        const btn: HTMLButtonElement | null = document.getElementById("resignRestartBtn") as HTMLButtonElement | null;
        if (!btn) return;

        btn.onclick = () => {
            btn.classList.remove("button-confirm", "button-restart");
            if (this._resignRestartState === "resign") {
                btn.querySelector(".btn-label")!.textContent = "Confirm Resign";
                btn.classList.add("button-confirm");
                this._resignRestartState = "confirm";

                if (this._resignConfirmTimeout !== null) {
                    clearTimeout(this._resignConfirmTimeout);
                }
                this._resignConfirmTimeout = window.setTimeout(() => {
                    this.resetResignRestartButton();
                    this._resignConfirmTimeout = null;
                }, 5000);

            } else if (this._resignRestartState === "confirm") {
                if (this._resignConfirmTimeout !== null) {
                    clearTimeout(this._resignConfirmTimeout);
                    this._resignConfirmTimeout = null;
                }
                this.resignGame();
                btn.querySelector(".btn-label")!.textContent = "Restart Game";
                btn.classList.add("button-restart");
                this._resignRestartState = "restart";
            } else if (this._resignRestartState === "restart") {
                window.location.reload();
            }
        };
    }

    private resetResignRestartButton(): void {
        const btn: HTMLButtonElement | null = document.getElementById("resignRestartBtn") as HTMLButtonElement | null;
        if (!btn) return;
        this._resignRestartState = "resign";
        btn.querySelector(".btn-label")!.textContent = "Resign";
        btn.classList.remove("button-confirm", "button-restart");
        if (this._resignConfirmTimeout !== null) {
            clearTimeout(this._resignConfirmTimeout);
            this._resignConfirmTimeout = null;
        }
    }

    private setResignRestartToRestart(): void {
        const btn: HTMLButtonElement | null = document.getElementById("resignRestartBtn") as HTMLButtonElement | null;
        if (!btn) return;
        this._resignRestartState = "restart";
        btn.querySelector(".btn-label")!.textContent = "Restart Game";
        btn.classList.remove("button-confirm");
        btn.classList.add("button-restart");
        if (this._resignConfirmTimeout !== null) {
            clearTimeout(this._resignConfirmTimeout);
            this._resignConfirmTimeout = null;
        }
        console.log("hello");
    }

    private resignGame(): void {
        if (this._game.activeColor === Color.White) {
            this._game.resign(Color.White);
        } else {
            this._game.resign(Color.Black);
        }
        this._isBoardEnabled = false;
        this.updateSaveGameState();
        this.updateControlButtons();
        this.renderAppropriateGameState();
        this._ui.renderStatus(this._game.status, this._game.activeColor);

        this._soundManager.playGenericNotifySound();
    }
}