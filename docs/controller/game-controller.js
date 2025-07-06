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
export class GameController {
    constructor(localPlayer, remotePlayer, game) {
        this._boardEventManager = new BoardEventManager();
        this._controlEventManager = new ControlEventManager();
        this._undoStack = [];
        this._redoStack = [];
        this._selectedSquare = null;
        this._boardEnabled = true;
        this._localPlayer = localPlayer;
        this._remotePlayer = remotePlayer;
        this._ui = new UiRenderer();
        this._game = game !== null && game !== void 0 ? game : GameFactory.fromStartingPosition();
        this.init();
    }
    init() {
        this._ui.render(this._game);
        const whitePlayer = this._localPlayer.color === Color.White ? this._localPlayer : this._remotePlayer;
        const blackPlayer = this._localPlayer.color === Color.Black ? this._localPlayer : this._remotePlayer;
        this._ui.renderPlayerNames(whitePlayer.name, blackPlayer.name);
        this.setupEventListeners();
    }
    setupEventListeners() {
        this._boardEventManager.setupBoardEventListeners((file, rank) => __awaiter(this, void 0, void 0, function* () {
            if (!this._boardEnabled)
                return;
            yield this.handleSquareClick(file, rank);
        }));
        this._controlEventManager.setupControlEventListeners({
            onUndo: () => this.undo(),
            onRedo: () => this.redo(),
            onHome: () => window.location.href = "index.html"
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
            this._ui.render(this._game);
            if (this._game.status !== "ongoing") {
                this._boardEventManager.removeBoardEventListeners();
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
            if (fromPiece) {
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
            const gameClone = this._game.clone();
            if (this._game.makeMove(move)) {
                this._undoStack.push(gameClone);
                this._redoStack = [];
                this._selectedSquare = null;
                this._ui.resetHighlights();
                this._ui.resetSelectHighlights();
                this._ui.render(this._game);
                this.highlightLastMove();
                this.updateControlButtons();
                yield this.tryBotMove();
            }
        });
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
        this._game = this._undoStack.pop();
        this._ui.resetHighlights();
        this._ui.resetSelectHighlights();
        this._ui.render(this._game);
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
        this._game = this._redoStack.pop();
        this._ui.resetHighlights();
        this._ui.resetSelectHighlights();
        this._ui.render(this._game);
        this.highlightLastMove();
        this.updateControlButtons();
    }
    enableBoard() {
        this._boardEnabled = true;
    }
    disableBoard() {
        this._boardEnabled = false;
    }
    updateControlButtons() {
        this._controlEventManager.updateControlButtons(this._undoStack.length > 0, this._redoStack.length > 0, this._game.status === "ongoing");
    }
}
