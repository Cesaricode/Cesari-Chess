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
import { Color } from "../chess/types/color.js";
import { BoardEventManager } from "../ui/board-event-manager.js";
import { UiRenderer } from "../ui/ui-renderer.js";
import { ControlEventManager } from "../ui/control-event-manager.js";
import { HistoryEventManager } from "../ui/history-event-manager.js";
import { FEN } from "../chess/util/fen.js";
import { SoundManager } from "../sounds/sound-manager.js";
import { BoardHighlighter } from "../ui/board-highlighter.js";
import { HistoryManager } from "../history/history-manager.js";
import { GameControlManager } from "../ui/game-control-manager.js";
import { GameStatus } from "../chess/types/game-status.js";
import { Variant } from "../types/variant.js";
export class GameController {
    // Initialisation
    constructor(localPlayer, remotePlayer, moveValidator, game) {
        this._ui = new UiRenderer();
        this._boardEventManager = new BoardEventManager();
        this._controlEventManager = new ControlEventManager();
        this._historyEventManager = new HistoryEventManager();
        this._soundManager = new SoundManager();
        this._historyManager = new HistoryManager();
        this._gameControlManager = new GameControlManager();
        this._selectedSquare = null;
        this._isBoardEnabled = true;
        this._isBoardFlipped = false;
        this._localPlayer = localPlayer;
        this._remotePlayer = remotePlayer;
        this._boardHighLighter = new BoardHighlighter(this._ui, moveValidator, game.variant);
        this._game = game;
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            this.renderAppropriateGameState();
            const whitePlayer = this._localPlayer.color === Color.White ? this._localPlayer : this._remotePlayer;
            const blackPlayer = this._localPlayer.color === Color.Black ? this._localPlayer : this._remotePlayer;
            this._ui.renderPlayerNames(whitePlayer.name, blackPlayer.name);
            this.setupEventListeners();
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
        this._gameControlManager.setupResignRestartButton(() => this.resignGame());
        this._gameControlManager.setupFenCopyButton(this._game);
    }
    // Public methods & getters/setters
    updateControlButtons() {
        this._controlEventManager.updateControlButtons(this._historyManager.undoStack.length > 0, this._historyManager.redoStack.length > 0, this._game.status === GameStatus.Ongoing);
    }
    get historyManager() {
        return this._historyManager;
    }
    // Event handlers
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
            if (this._game.status !== GameStatus.Ongoing) {
                this._boardEventManager.removeBoardEventListeners();
            }
            this.setUserHasInteracted();
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
            if (this.isSelectingOwnPieceAgain(fromPiece, toPiece) && !this.isSelectingRookForCastle(fromPiece, toPiece)) {
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
    // Game flow
    attemptMove(move) {
        return __awaiter(this, void 0, void 0, function* () {
            const targetPiece = this._game.board.getPieceAt(move.to);
            const gameClone = this._game.clone();
            if (this._game.makeMove(move)) {
                this._historyManager.pushUndo(gameClone);
                yield this.handleSuccesfulMove(move, targetPiece);
            }
        });
    }
    handleSuccesfulMove(move, targetPiece) {
        return __awaiter(this, void 0, void 0, function* () {
            this._historyManager.clearRedo();
            this._selectedSquare = null;
            this._boardHighLighter.resetAllHiglights();
            this.renderAppropriateGameState();
            this._boardHighLighter.highlightLastMove(this._game);
            this.updateControlButtons();
            this._ui.renderStatus(this._game.status, this._game.activeColor);
            this._gameControlManager.resetResignRestartButton();
            if (this._game.status !== GameStatus.Ongoing) {
                this._soundManager.playGenericNotifySound();
                this._gameControlManager.setResignRestartToRestart();
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
    tryBotMove() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._game.status === GameStatus.Ongoing) {
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
    resignGame() {
        if (this._game.activeColor === Color.White) {
            this._game.resign(Color.White);
        }
        else {
            this._game.resign(Color.Black);
        }
        this.disableBoard();
        this.updateSaveGameState();
        this.updateControlButtons();
        this.renderAppropriateGameState();
        this._ui.renderStatus(this._game.status, this._game.activeColor);
        this._soundManager.playGenericNotifySound();
    }
    // Game savestate
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
            variant: this._game.variant,
        };
        localStorage.setItem("cesariChessSave", JSON.stringify(saveData));
    }
    updateSaveGameState() {
        if (this._game.status === GameStatus.Ongoing) {
            this.saveGameState();
        }
        else {
            localStorage.removeItem("cesariChessSave");
        }
    }
    // Rendering
    renderAppropriateGameState() {
        if ((this._historyManager.lastHistoryIndex === null && this._historyManager.historyIndex !== null) ||
            (this._historyManager.lastHistoryIndex !== null && this._historyManager.historyIndex === null)) {
            this._boardHighLighter.resetAllHiglights();
        }
        this._historyManager.lastHistoryIndex = this._historyManager.historyIndex;
        const { gameToRender, activeMoveIndex } = this._historyManager.getDisplayGameAndMoveIndex(this._game);
        this._ui.render(gameToRender, activeMoveIndex);
        this._boardHighLighter.highlightHistoryMove(gameToRender, activeMoveIndex);
        this._historyEventManager.updateHistoryRoster();
    }
    // Undo & redo / History navigation
    undo() {
        var _a;
        this._game = (_a = this._historyManager.undo(this._game, this._remotePlayer.isBot, this._localPlayer.color, this._remotePlayer)) !== null && _a !== void 0 ? _a : this._game;
        this._boardHighLighter.resetAllHiglights();
        this.renderAppropriateGameState();
        this._boardHighLighter.highlightLastMove(this._game);
        this.updateControlButtons();
    }
    redo() {
        var _a;
        this._game = (_a = this._historyManager.redo(this._game, this._remotePlayer.isBot, this._localPlayer.color, this._remotePlayer)) !== null && _a !== void 0 ? _a : this._game;
        this._boardHighLighter.resetAllHiglights();
        this.renderAppropriateGameState();
        this._boardHighLighter.highlightLastMove(this._game);
        this.updateControlButtons();
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
    // Helpers
    isSelectingRookForCastle(fromPiece, toPiece) {
        if (fromPiece &&
            toPiece &&
            fromPiece.type === "king" &&
            toPiece.type === "rook" &&
            fromPiece.color === toPiece.color &&
            fromPiece.color === this._game.activeColor &&
            !toPiece.state.hasMoved &&
            !fromPiece.state.hasMoved) {
            const color = fromPiece.color;
            const rookX = toPiece.position.x;
            const isKingside = rookX > fromPiece.position.x;
            const rights = this._game.castlingRights;
            if (color === Color.White) {
                if (isKingside && rights.whiteKingSide)
                    return true;
                if (!isKingside && rights.whiteQueenSide)
                    return true;
            }
            else {
                if (isKingside && rights.blackKingSide)
                    return true;
                if (!isKingside && rights.blackQueenSide)
                    return true;
            }
        }
        return false;
    }
    setBoardFlipped(flipped) {
        this._isBoardFlipped = flipped;
        const boardContainer = document.getElementById("chessBoardContainer");
        if (boardContainer) {
            boardContainer.classList.toggle("flipped", this._isBoardFlipped);
        }
        this.renderAppropriateGameState();
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
        var _a;
        const color = fromPiece.color;
        let promotion = undefined;
        if (fromPiece.type === "king" &&
            ((_a = this._game.board.getPieceAt(to)) === null || _a === void 0 ? void 0 : _a.type) === "rook" &&
            this.isSelectingRookForCastle(fromPiece, this._game.board.getPieceAt(to))) {
            const isKingside = to.x > from.x;
            const kingDestX = isKingside ? 6 : 2;
            const kingDest = { x: kingDestX, y: from.y };
            return {
                from,
                to: kingDest,
                piece: fromPiece.type,
                color,
                castling: true
            };
        }
        if (fromPiece.type === "king" &&
            Math.abs(from.x - to.x) > 1 &&
            this._game.variant === Variant.Standard) {
            return {
                from,
                to,
                piece: fromPiece.type,
                color,
                castling: true
            };
        }
        if (fromPiece.type === "pawn" &&
            ((color === "white" && to.y === 7) || (color === "black" && to.y === 0))) {
            promotion = this.getPromotionChoice();
        }
        return Object.assign(Object.assign({ from, to, piece: fromPiece.type, color }, (promotion ? { promotion } : {})), { castling: false });
    }
    setUserHasInteracted() {
        if (!this._soundManager.userHasInteracted) {
            this._soundManager.userHasInteracted = true;
        }
    }
    enableBoard() {
        this._isBoardEnabled = true;
    }
    disableBoard() {
        this._isBoardEnabled = false;
    }
}
