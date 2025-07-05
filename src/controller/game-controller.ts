import { FILES, RANKS } from "../chess/constants/board.js";
import { GameFactory } from "../chess/game/game-factory.js";
import { Game } from "../chess/game/game.js";
import { Piece } from "../chess/pieces/piece.js";
import { MoveValidator } from "../chess/rules/move-validator.js";
import { Color } from "../chess/types/color.js";
import { Move } from "../chess/types/move.js";
import { Position } from "../chess/types/position.js";
import { PromotionPieceType } from "../chess/types/promotion-piece-type.js";
import { Player } from "../player/player.js";
import { UiRenderer } from "../ui/ui-renderer.js";

export class GameController {

    private _game: Game;
    private _ui: UiRenderer;
    private _localPlayer: Player;
    private _remotePlayer: Player;

    private _undoStack: Game[] = [];
    private _redoStack: Game[] = [];

    private _boardListeners: Array<{ el: HTMLElement, handler: EventListener; }> = [];

    private _selectedSquare: Position | null = null;

    public constructor(localPlayer: Player, remotePlayer: Player, game?: Game) {
        this._localPlayer = localPlayer;
        this._remotePlayer = remotePlayer;
        this._ui = new UiRenderer();
        this._game = game ?? GameFactory.fromStartingPosition();
        this.init();
    }

    private init(): void {
        this._ui.render(this._game);
        this.setupBoardEventListeners();
        this.setupControlEventListeners();
    }

    private setupBoardEventListeners(): void {
        for (const file of FILES) {
            for (const rank of RANKS) {
                const square: HTMLElement | null = document.getElementById(`${file}${rank}`);
                if (square) {
                    const handler = () => this.handleSquareClick(file, rank);
                    square.addEventListener("click", handler);
                    this._boardListeners.push({ el: square, handler });
                }
            }
        }
    }

    private setupControlEventListeners(): void {
        const undoBtn: HTMLElement | null = document.getElementById("undoBtn") as HTMLButtonElement | null;
        const redoBtn: HTMLElement | null = document.getElementById("redoBtn") as HTMLButtonElement | null;
        const homeBtn: HTMLElement | null = document.getElementById("homeBtn") as HTMLButtonElement | null;
        if (homeBtn) homeBtn.onclick = () => window.location.href = "index.html";
        if (undoBtn) undoBtn.onclick = () => this.undo();
        if (redoBtn) redoBtn.onclick = () => this.redo();
    }

    private removeBoardEventListeners(): void {
        for (const { el, handler } of this._boardListeners) {
            el.removeEventListener("click", handler);
        }
        this._boardListeners = [];
    }

    private handleSquareClick(file: typeof FILES[number], rank: typeof RANKS[number]): void {
        const pos: Position = { x: FILES.indexOf(file), y: rank - 1 };

        if (!this._selectedSquare) {
            this.handleFirstSquareClick(pos, file, rank);
        } else {
            this.handleSecondSquareClick(pos);
        }
        this._ui.render(this._game);

        if (this._game.status !== "ongoing") {
            this.removeBoardEventListeners();
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

    private handleSecondSquareClick(to: Position): void {
        const from: Position = this._selectedSquare!;
        const fromPiece: Piece | null = this._game.board.getPieceAt(from);
        const toPiece: Piece | null = this._game.board.getPieceAt(to);

        if (this.isSelectingSamePiece(fromPiece, toPiece)) {
            this._ui.resetSelect();
            this._selectedSquare = null;
        }

        if (this.isSelectingOwnPieceAgain(fromPiece, toPiece)) {
            this.selectNewPiece(toPiece!, to);
            return;
        }

        if (fromPiece) {
            const move: Move = this.buildMoveObject(fromPiece, from, to);
            this.attemptMove(move);
            this._ui.resetSelect();
        }
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

    private attemptMove(move: Move): void {
        const gameClone: Game = this._game.clone();
        if (this._game.makeMove(move)) {
            this._undoStack.push(gameClone);
            this._redoStack = [];
            this._selectedSquare = null;
            this._ui.resetHighlights();
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
            const targetPiece = this._game.board.getPieceAt(movePos);
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
                castlingTargets.push({ x: 6, y: 0 }); // g1
                castlingTargets.push({ x: 2, y: 0 }); // c1
            }
            if (piece.color === "black" && from.x === 4 && from.y === 7) {
                castlingTargets.push({ x: 6, y: 7 }); // g8
                castlingTargets.push({ x: 2, y: 7 }); // c8
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

    public undo(): void {
        if (this._undoStack.length === 0) return;
        this._redoStack.push(this._game.clone());
        this._game = this._undoStack.pop()!;
        this._ui.render(this._game);
    }

    public redo(): void {
        if (this._redoStack.length === 0) return;
        this._undoStack.push(this._game.clone());
        this._game = this._redoStack.pop()!;
        this._ui.render(this._game);
    }
}