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
import { MoveValidator } from "../chess/rules/move-validator.js";
import { Color } from "../chess/types/color.js";
import { BoardEventManager } from "../ui/board-event-manager.js";
import { UiRenderer } from "../ui/ui-renderer.js";
import { ControlEventManager } from "../ui/control-event-manager.js";
import { HistoryEventManager } from "../ui/history-event-manager.js";
import { FEN } from "../chess/util/fen.js";
import { SoundManager } from "../sounds/sound-manager.js";
export class GameController {
    constructor(localPlayer, remotePlayer, game) {
        this._boardEventManager = new BoardEventManager();
        this._controlEventManager = new ControlEventManager();
        this._historyEventManager = new HistoryEventManager();
        this._soundManager = new SoundManager();
        this._undoStack = [];
        this._redoStack = [];
        this._historyIndex = null;
        this._lastHistoryIndex = null;
        this._selectedSquare = null;
        this._isBoardEnabled = true;
        this._isBoardFlipped = false;
        this._resignRestartState = "resign";
        this._resignConfirmTimeout = null;
        this._localPlayer = localPlayer;
        this._remotePlayer = remotePlayer;
        this._ui = new UiRenderer();
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
            this.highlightLegalMoves(piece, pos);
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
            if (fromPiece !== null && this._historyIndex === null) {
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
        this.highlightLegalMoves(piece, pos);
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
                this._undoStack.push(gameClone);
                this.handleSuccesfulMove(move, targetPiece);
            }
        });
    }
    handleSuccesfulMove(move, targetPiece) {
        return __awaiter(this, void 0, void 0, function* () {
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
    highlightLegalMoves(piece, from) {
        const pseudoLegalMoves = piece.getPseudoLegalMoves();
        for (const movePos of pseudoLegalMoves) {
            const move = {
                from,
                to: movePos,
                piece: piece.type,
                color: piece.color
            };
            if (!MoveValidator.validateMove(this._game, move))
                continue;
            const targetFile = FILES[movePos.x];
            const targetRank = movePos.y + 1;
            const targetPiece = this._game.board.getPieceAt(movePos);
            if (targetPiece && targetPiece.color !== piece.color) {
                this._ui.highlightSquare(`${targetFile}${targetRank}`, "targethighlighted");
            }
            else {
                this._ui.highlightSquare(`${targetFile}${targetRank}`);
            }
        }
        this.higlightLegalCastlingMoves(piece, from);
    }
    higlightLegalCastlingMoves(piece, from) {
        if (piece.type === "king") {
            const castlingTargets = [];
            if (piece.color === "white" && from.x === 4 && from.y === 0) {
                castlingTargets.push({ x: 6, y: 0 });
                castlingTargets.push({ x: 2, y: 0 });
            }
            if (piece.color === "black" && from.x === 4 && from.y === 7) {
                castlingTargets.push({ x: 6, y: 7 });
                castlingTargets.push({ x: 2, y: 7 });
            }
            for (const castlePos of castlingTargets) {
                const move = {
                    from,
                    to: castlePos,
                    piece: piece.type,
                    color: piece.color
                };
                if (MoveValidator.validateMove(this._game, move)) {
                    const targetFile = FILES[castlePos.x];
                    const targetRank = castlePos.y + 1;
                    this._ui.highlightSquare(`${targetFile}${targetRank}`);
                }
            }
        }
    }
    highlightLastMove() {
        const lastMove = this._game.moveHistory.length > 0
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
    undo() {
        if (this._undoStack.length === 0)
            return;
        this._redoStack.push(this._game.clone());
        if (this._remotePlayer.isBot && this._game.activeColor === this._localPlayer.color) {
            this._redoStack.push(this._undoStack.pop());
        }
        this._historyIndex = null;
        this._game = this._undoStack.pop();
        this._ui.resetHighlights();
        this._ui.resetSelectHighlights();
        this.renderAppropriateGameState();
        this.highlightLastMove();
        this.updateControlButtons();
    }
    redo() {
        if (this._redoStack.length === 0)
            return;
        this._undoStack.push(this._game.clone());
        if (this._remotePlayer.isBot && this._game.activeColor === this._localPlayer.color) {
            this._undoStack.push(this._redoStack.pop());
        }
        this._historyIndex = null;
        this._game = this._redoStack.pop();
        this._ui.resetHighlights();
        this._ui.resetSelectHighlights();
        this.renderAppropriateGameState();
        this.highlightLastMove();
        this.updateControlButtons();
    }
    enableBoard() {
        this._isBoardEnabled = true;
    }
    disableBoard() {
        this._isBoardEnabled = false;
    }
    updateControlButtons() {
        this._controlEventManager.updateControlButtons(this._undoStack.length > 0, this._redoStack.length > 0, this._game.status === "ongoing");
    }
    renderAppropriateGameState() {
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
    getDisplayGameAndMoveIndex() {
        if (this._historyIndex === null) {
            return {
                gameToRender: this._game,
                activeMoveIndex: this._game.moveHistory.length - 1
            };
        }
        else {
            const historyGame = this.getGameAtHistoryIndex(this._historyIndex).clone();
            this.addMissingMovesToHistoryGame(historyGame);
            const activeMoveIndex = this.calculateActiveMoveIndex(historyGame);
            return { gameToRender: historyGame, activeMoveIndex };
        }
    }
    addMissingMovesToHistoryGame(historyGame) {
        const start = historyGame.moveHistory.length;
        const missingMoves = this._game.moveHistory.slice(start);
        for (const move of missingMoves) {
            historyGame.addToMoveHistory(move);
        }
    }
    calculateActiveMoveIndex(historyGame) {
        var _a;
        return historyGame.moveHistory.length - (this._game.moveHistory.length - ((_a = this._historyIndex) !== null && _a !== void 0 ? _a : 0)) - 1;
    }
    highlightHistoryMove(game, moveIndex) {
        if (moveIndex !== null && moveIndex >= 0 && moveIndex < game.moveHistory.length) {
            const move = game.moveHistory[moveIndex];
            this._ui.highlightLastMove(FILES[move.from.x] + (move.from.y + 1), FILES[move.to.x] + (move.to.y + 1));
        }
        else {
            this._ui.resetLastMoveHighlights();
        }
    }
    getGameAtHistoryIndex(historyIndex) {
        return this._undoStack[historyIndex];
    }
    goBackInHistory() {
        this._selectedSquare = null;
        if (this._undoStack.length === 0 || this._historyIndex !== null && this._historyIndex <= 0)
            return;
        if (this._historyIndex === null) {
            this._historyIndex = this._undoStack.length - 1;
        }
        else {
            this._historyIndex = this._historyIndex - 1;
        }
        this.renderAppropriateGameState();
    }
    goForwardInHistory() {
        this._selectedSquare = null;
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
        this.renderAppropriateGameState();
    }
    goToHistoryIndex(index) {
        this._selectedSquare = null;
        if (this._undoStack.length === 0 || index < 0 || index > this._undoStack.length)
            return;
        if (index === this._undoStack.length) {
            this._historyIndex = null;
        }
        else {
            this._historyIndex = index;
        }
        this.renderAppropriateGameState();
    }
    resetHistoryView() {
        this._historyIndex = null;
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
    setUndoStack(stack) {
        this._undoStack = stack;
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
}
