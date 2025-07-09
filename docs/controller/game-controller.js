var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { FILES } from "../chess/constants/board.js";
import { GameFactory } from "../chess/game/game-factory.js";
import { Color } from "../chess/types/color.js";
import { BoardEventManager } from "../ui/board-event-manager.js";
import { UiRenderer } from "../ui/ui-renderer.js";
import { ControlEventManager } from "../ui/control-event-manager.js";
import { HistoryEventManager } from "../ui/history-event-manager.js";
import { FEN } from "../chess/util/fen.js";
import { SoundManager } from "../sounds/sound-manager.js";
import { BoardHighlighter } from "../ui/board-highlighter.js";
import { HistoryManager } from "../history/history-manager.js";
export class GameController {
    constructor(localPlayer, remotePlayer, game) {
        this._ui = new UiRenderer();
        this._boardEventManager = new BoardEventManager();
        this._controlEventManager = new ControlEventManager();
        this._historyEventManager = new HistoryEventManager();
        this._soundManager = new SoundManager();
        this._historyManager = new HistoryManager();
        this._selectedSquare = null;
        this._isBoardEnabled = true;
        this._isBoardFlipped = false;
        this._resignRestartState = "resign";
        this._resignConfirmTimeout = null;
        this._localPlayer = localPlayer;
        this._remotePlayer = remotePlayer;
        this._boardHighLighter = new BoardHighlighter(this._ui);
        this._game = game !== null && game !== void 0 ? game : GameFactory.fromStartingPosition();
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            this.renderAppropriateGameState();
            const whitePlayer = this._localPlayer.color === Color.White ? this._localPlayer : this._remotePlayer;
            const blackPlayer = this._localPlayer.color === Color.Black ? this._localPlayer : this._remotePlayer;
            this._ui.renderPlayerNames(whitePlayer.name, blackPlayer.name);
            this.setupEventListeners();
            this.setupResignRestartButton();
            if (this._localPlayer.color === Color.Black) {
                this.setBoardFlipped(true);
            }
            if (this._game.activeColor !== this._localPlayer.color) {
                yield this.tryBotMove();
            }
            this._ui.renderStatus(this._game.status, this._game.activeColor);
        });
    }
    setupEventListeners() {
        this._boardEventManager.setupBoardEventListeners((file, rank) => __awaiter(this, void 0, void 0, function* () {
            if (!this._isBoardEnabled)
                return;
            yield this.handleSquareClick(file, rank);
        }));
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
            onGoTo: (index) => this.goToHistoryIndex(index)
        });
    }
    handleSquareClick(file, rank) {
        return __awaiter(this, void 0, void 0, function* () {
            const pos = { x: FILES.indexOf(file), y: rank - 1 };
            if (!this._selectedSquare) {
                this.handleFirstSquareClick(pos, file, rank);
            }
            else {
                yield this.handleSecondSquareClick(pos);
            }
            this.resetHistoryView();
            if (this._game.status !== "ongoing") {
                this._boardEventManager.removeBoardEventListeners();
            }
            if (!this._soundManager.userHasInteracted) {
                this._soundManager.userHasInteracted = true;
            }
        });
    }
    handleFirstSquareClick(pos, file, rank) {
        this._selectedSquare = pos;
        this._ui.resetHighlights();
        const piece = this._game.board.getPieceAt(pos);
        if (piece && piece.color === this._game.activeColor) {
            this._boardHighLighter.highlightLegalMoves(this._game, piece, pos);
            this._ui.selectSquare(`${file}${rank}`);
        }
        else {
            this._selectedSquare = null;
        }
    }
    handleSecondSquareClick(to) {
        return __awaiter(this, void 0, void 0, function* () {
            const from = this._selectedSquare;
            const fromPiece = this._game.board.getPieceAt(from);
            const toPiece = this._game.board.getPieceAt(to);
            this._ui.resetHighlights();
            if (this.isSelectingSamePiece(fromPiece, toPiece)) {
                this._ui.resetSelectHighlights();
                this._selectedSquare = null;
            }
            if (this.isSelectingOwnPieceAgain(fromPiece, toPiece)) {
                this.selectNewPiece(toPiece, to);
                return;
            }
            if (fromPiece !== null && this._historyManager.historyIndex === null) {
                const move = this.buildMoveObject(fromPiece, from, to);
                yield this.attemptMove(move);
                this._ui.resetSelectHighlights();
            }
            this._selectedSquare = null;
        });
    }
    isSelectingSamePiece(fromPiece, toPiece) {
        return fromPiece === toPiece;
    }
    isSelectingOwnPieceAgain(fromPiece, toPiece) {
        return Boolean(toPiece &&
            fromPiece &&
            toPiece !== fromPiece &&
            toPiece.color === fromPiece.color &&
            toPiece.color === this._game.activeColor);
    }
    selectNewPiece(piece, pos) {
        this._selectedSquare = pos;
        this._ui.resetHighlights();
        this._boardHighLighter.highlightLegalMoves(this._game, piece, pos);
        const targetFile = FILES[pos.x];
        const targetRank = pos.y + 1;
        this._ui.selectSquare(`${targetFile}${targetRank}`);
    }
    getPromotionChoice() {
        const promoteSelect = document.getElementById("promote");
        if (promoteSelect) {
            return promoteSelect.value;
        }
        return undefined;
    }
    buildMoveObject(fromPiece, from, to) {
        const color = fromPiece.color;
        let promotion = undefined;
        if (fromPiece.type === "pawn" &&
            ((color === "white" && to.y === 7) || (color === "black" && to.y === 0))) {
            promotion = this.getPromotionChoice();
        }
        return Object.assign({ from, to, piece: fromPiece.type, color }, (promotion ? { promotion } : {}));
    }
    attemptMove(move) {
        return __awaiter(this, void 0, void 0, function* () {
            const targetPiece = this._game.board.getPieceAt(move.to);
            const gameClone = this._game.clone();
            if (this._game.makeMove(move)) {
                this._historyManager.pushUndo(gameClone);
                this.handleSuccesfulMove(move, targetPiece);
            }
        });
    }
    handleSuccesfulMove(move, targetPiece) {
        return __awaiter(this, void 0, void 0, function* () {
            this._historyManager.clearRedo();
            this._selectedSquare = null;
            this._ui.resetHighlights();
            this._ui.resetSelectHighlights();
            this.renderAppropriateGameState();
            this._boardHighLighter.highlightLastMove(this._game);
            this.updateControlButtons();
            this._ui.renderStatus(this._game.status, this._game.activeColor);
            this.resetResignRestartButton();
            if (this._game.status !== "ongoing") {
                this._soundManager.playGenericNotifySound();
                this.setResignRestartToRestart();
            }
            else if (targetPiece && targetPiece.color !== move.color) {
                this._soundManager.playCaptureSound();
            }
            else {
                this._soundManager.playMoveSound();
            }
            this.updateSaveGameState();
            yield this.tryBotMove();
        });
    }
    updateSaveGameState() {
        if (this._game.status === "ongoing") {
            this.saveGameState();
        }
        else {
            localStorage.removeItem("cesariChessSave");
        }
    }
    tryBotMove() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._game.status === "ongoing") {
                const currentPlayer = this._game.activeColor === this._localPlayer.color ? this._localPlayer : this._remotePlayer;
                if (currentPlayer.isBot && typeof currentPlayer.getMove === "function") {
                    this.disableBoard();
                    const move = yield currentPlayer.getMove(this._game);
                    yield this.attemptMove(move);
                    this.enableBoard();
                }
            }
        });
    }
    undo() {
        var _a;
        this._game = (_a = this._historyManager.undo(this._game, this._remotePlayer.isBot, this._localPlayer.color, this._remotePlayer)) !== null && _a !== void 0 ? _a : this._game;
        this._ui.resetHighlights();
        this._ui.resetSelectHighlights();
        this.renderAppropriateGameState();
        this._boardHighLighter.highlightLastMove(this._game);
        this.updateControlButtons();
    }
    redo() {
        var _a;
        this._game = (_a = this._historyManager.redo(this._game, this._remotePlayer.isBot, this._localPlayer.color, this._remotePlayer)) !== null && _a !== void 0 ? _a : this._game;
        this._ui.resetHighlights();
        this._ui.resetSelectHighlights();
        this.renderAppropriateGameState();
        this._boardHighLighter.highlightLastMove(this._game);
        this.updateControlButtons();
    }
    enableBoard() {
        this._isBoardEnabled = true;
    }
    disableBoard() {
        this._isBoardEnabled = false;
    }
    updateControlButtons() {
        this._controlEventManager.updateControlButtons(this._historyManager.undoStack.length > 0, this._historyManager.redoStack.length > 0, this._game.status === "ongoing");
    }
    renderAppropriateGameState() {
        if ((this._historyManager.lastHistoryIndex === null && this._historyManager.historyIndex !== null) ||
            (this._historyManager.lastHistoryIndex !== null && this._historyManager.historyIndex === null)) {
            this._ui.resetHighlights();
            this._ui.resetSelectHighlights();
        }
        this._historyManager.lastHistoryIndex = this._historyManager.historyIndex;
        const { gameToRender, activeMoveIndex } = this._historyManager.getDisplayGameAndMoveIndex(this._game);
        this._ui.render(gameToRender, activeMoveIndex);
        this._boardHighLighter.highlightHistoryMove(gameToRender, activeMoveIndex);
        this._historyEventManager.updateHistoryRoster();
    }
    resetHistoryView() {
        this._historyManager.historyIndex = null;
        this.renderAppropriateGameState();
    }
    goBackInHistory() {
        this._selectedSquare = null;
        this._historyManager.goBackInHistory();
        this.renderAppropriateGameState();
    }
    goForwardInHistory() {
        this._selectedSquare = null;
        this._historyManager.goForwardInHistory();
        this.renderAppropriateGameState();
    }
    goToHistoryIndex(index) {
        this._selectedSquare = null;
        this._historyManager.goToHistoryIndex(index);
        this.renderAppropriateGameState();
    }
    setBoardFlipped(flipped) {
        this._isBoardFlipped = flipped;
        const boardContainer = document.getElementById("chessBoardContainer");
        if (boardContainer) {
            boardContainer.classList.toggle("flipped", this._isBoardFlipped);
        }
        this.renderAppropriateGameState();
    }
    saveGameState() {
        if (!this._remotePlayer.isBot)
            return;
        const saveData = {
            fen: FEN.serializeFullFEN(this._game),
            initialFen: this._game.initialFEN,
            moveHistory: this._game.moveHistory,
            localColor: this._localPlayer.color,
            botType: this._remotePlayer.name,
            botColor: this._remotePlayer.color,
        };
        localStorage.setItem("cesariChessSave", JSON.stringify(saveData));
    }
    setupResignRestartButton() {
        const btn = document.getElementById("resignRestartBtn");
        if (!btn)
            return;
        btn.onclick = () => {
            btn.classList.remove("button-confirm", "button-restart");
            if (this._resignRestartState === "resign") {
                btn.querySelector(".btn-label").textContent = "Confirm Resign";
                btn.classList.add("button-confirm");
                this._resignRestartState = "confirm";
                if (this._resignConfirmTimeout !== null) {
                    clearTimeout(this._resignConfirmTimeout);
                }
                this._resignConfirmTimeout = window.setTimeout(() => {
                    this.resetResignRestartButton();
                    this._resignConfirmTimeout = null;
                }, 5000);
            }
            else if (this._resignRestartState === "confirm") {
                if (this._resignConfirmTimeout !== null) {
                    clearTimeout(this._resignConfirmTimeout);
                    this._resignConfirmTimeout = null;
                }
                this.resignGame();
                btn.querySelector(".btn-label").textContent = "Restart Game";
                btn.classList.add("button-restart");
                this._resignRestartState = "restart";
            }
            else if (this._resignRestartState === "restart") {
                window.location.reload();
            }
        };
    }
    resetResignRestartButton() {
        const btn = document.getElementById("resignRestartBtn");
        if (!btn)
            return;
        this._resignRestartState = "resign";
        btn.querySelector(".btn-label").textContent = "Resign";
        btn.classList.remove("button-confirm", "button-restart");
        if (this._resignConfirmTimeout !== null) {
            clearTimeout(this._resignConfirmTimeout);
            this._resignConfirmTimeout = null;
        }
    }
    setResignRestartToRestart() {
        const btn = document.getElementById("resignRestartBtn");
        if (!btn)
            return;
        this._resignRestartState = "restart";
        btn.querySelector(".btn-label").textContent = "Restart Game";
        btn.classList.remove("button-confirm");
        btn.classList.add("button-restart");
        if (this._resignConfirmTimeout !== null) {
            clearTimeout(this._resignConfirmTimeout);
            this._resignConfirmTimeout = null;
        }
    }
    resignGame() {
        if (this._game.activeColor === Color.White) {
            this._game.resign(Color.White);
        }
        else {
            this._game.resign(Color.Black);
        }
        this._isBoardEnabled = false;
        this.updateSaveGameState();
        this.updateControlButtons();
        this.renderAppropriateGameState();
        this._ui.renderStatus(this._game.status, this._game.activeColor);
        this._soundManager.playGenericNotifySound();
    }
    get historyManager() {
        return this._historyManager;
    }
}
