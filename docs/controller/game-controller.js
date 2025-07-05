import { FILES, RANKS } from "../chess/constants/board.js";
import { GameFactory } from "../chess/game/game-factory.js";
import { MoveValidator } from "../chess/rules/move-validator.js";
import { UiRenderer } from "../ui/ui-renderer.js";
export class GameController {
    constructor(localPlayer, remotePlayer, game) {
        this._undoStack = [];
        this._redoStack = [];
        this._boardListeners = [];
        this._selectedSquare = null;
        this._localPlayer = localPlayer;
        this._remotePlayer = remotePlayer;
        this._ui = new UiRenderer();
        this._game = game !== null && game !== void 0 ? game : GameFactory.fromStartingPosition();
        this.init();
    }
    init() {
        this._ui.render(this._game);
        this.setupBoardEventListeners();
        this.setupControlEventListeners();
    }
    setupBoardEventListeners() {
        for (const file of FILES) {
            for (const rank of RANKS) {
                const square = document.getElementById(`${file}${rank}`);
                if (square) {
                    const handler = () => this.handleSquareClick(file, rank);
                    square.addEventListener("click", handler);
                    this._boardListeners.push({ el: square, handler });
                }
            }
        }
    }
    setupControlEventListeners() {
        const undoBtn = document.getElementById("undoBtn");
        const redoBtn = document.getElementById("redoBtn");
        const homeBtn = document.getElementById("homeBtn");
        if (homeBtn)
            homeBtn.onclick = () => window.location.href = "index.html";
        if (undoBtn)
            undoBtn.onclick = () => this.undo();
        if (redoBtn)
            redoBtn.onclick = () => this.redo();
    }
    removeBoardEventListeners() {
        for (const { el, handler } of this._boardListeners) {
            el.removeEventListener("click", handler);
        }
        this._boardListeners = [];
    }
    handleSquareClick(file, rank) {
        const pos = { x: FILES.indexOf(file), y: rank - 1 };
        if (!this._selectedSquare) {
            this.handleFirstSquareClick(pos, file, rank);
        }
        else {
            this.handleSecondSquareClick(pos);
        }
        this._ui.render(this._game);
        if (this._game.status !== "ongoing") {
            this.removeBoardEventListeners();
        }
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
        const from = this._selectedSquare;
        const fromPiece = this._game.board.getPieceAt(from);
        const toPiece = this._game.board.getPieceAt(to);
        if (this.isSelectingSamePiece(fromPiece, toPiece)) {
            this._ui.resetSelect();
            this._selectedSquare = null;
        }
        if (this.isSelectingOwnPieceAgain(fromPiece, toPiece)) {
            this.selectNewPiece(toPiece, to);
            return;
        }
        if (fromPiece) {
            const move = this.buildMoveObject(fromPiece, from, to);
            this.attemptMove(move);
            this._ui.resetSelect();
        }
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
        const gameClone = this._game.clone();
        if (this._game.makeMove(move)) {
            this._undoStack.push(gameClone);
            this._redoStack = [];
            this._selectedSquare = null;
            this._ui.resetHighlights();
        }
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
                castlingTargets.push({ x: 6, y: 0 }); // g1
                castlingTargets.push({ x: 2, y: 0 }); // c1
            }
            if (piece.color === "black" && from.x === 4 && from.y === 7) {
                castlingTargets.push({ x: 6, y: 7 }); // g8
                castlingTargets.push({ x: 2, y: 7 }); // c8
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
    undo() {
        if (this._undoStack.length === 0)
            return;
        this._redoStack.push(this._game.clone());
        this._game = this._undoStack.pop();
        this._ui.render(this._game);
    }
    redo() {
        if (this._redoStack.length === 0)
            return;
        this._undoStack.push(this._game.clone());
        this._game = this._redoStack.pop();
        this._ui.render(this._game);
    }
}
