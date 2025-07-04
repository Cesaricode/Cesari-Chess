import { FILES, RANKS } from "../chess/constants/board.js";
import { GameFactory } from "../chess/game/game-factory.js";
import { MoveValidator } from "../chess/rules/move-validator.js";
import { UiRenderer } from "../ui/ui-renderer.js";
export class GameController {
    constructor(localPlayer, remotePlayer, game) {
        this.selectedSquare = null;
        this._localPlayer = localPlayer;
        this._remotePlayer = remotePlayer;
        this._ui = new UiRenderer();
        this._game = game !== null && game !== void 0 ? game : GameFactory.fromStartingPosition();
        this.init();
    }
    init() {
        this._ui.render(this._game);
        this.setupBoardEventListeners();
    }
    setupBoardEventListeners() {
        for (const file of FILES) {
            for (const rank of RANKS) {
                const square = document.getElementById(`${file}${rank}`);
                if (square) {
                    square.addEventListener("click", () => this.handleSquareClick(file, rank));
                }
            }
        }
    }
    handleSquareClick(file, rank) {
        const pos = { x: FILES.indexOf(file), y: rank - 1 };
        if (!this.selectedSquare) {
            this.handleFirstSquareClick(pos, file, rank);
        }
        else {
            this.handleSecondSquareClick(pos);
        }
        this._ui.render(this._game);
    }
    handleFirstSquareClick(pos, file, rank) {
        this.selectedSquare = pos;
        this._ui.resetHighlights();
        const piece = this._game.board.getPieceAt(pos);
        if (piece && piece.color === this._game.activeColor) {
            this.highlightLegalMoves(piece, pos);
            this._ui.highlightSquare(`${file}${rank}`);
        }
        else {
            this.selectedSquare = null;
        }
    }
    handleSecondSquareClick(to) {
        const from = this.selectedSquare;
        const fromPiece = this._game.board.getPieceAt(from);
        const toPiece = this._game.board.getPieceAt(to);
        if (toPiece &&
            fromPiece &&
            toPiece !== fromPiece &&
            toPiece.color === fromPiece.color &&
            toPiece.color === this._game.activeColor) {
            this.selectedSquare = to;
            this._ui.resetHighlights();
            this.highlightLegalMoves(toPiece, to);
            const targetFile = FILES[to.x];
            const targetRank = to.y + 1;
            this._ui.highlightSquare(`${targetFile}${targetRank}`);
            return;
        }
        const color = fromPiece ? fromPiece.color : undefined;
        if (fromPiece && color) {
            const move = { from, to, piece: fromPiece.type, color };
            this._game.makeMove(move);
        }
        this.selectedSquare = null;
        this._ui.resetHighlights();
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
            this._ui.highlightSquare(`${targetFile}${targetRank}`);
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
}
