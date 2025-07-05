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

export class GameController {

    private _game: Game;
    private _ui: UiRenderer;
    private _boardEventManager: BoardEventManager = new BoardEventManager();
    private _controlEventManager: ControlEventManager = new ControlEventManager();

    private _localPlayer: Player;
    private _remotePlayer: Player;

    private _undoStack: Game[] = [];
    private _redoStack: Game[] = [];

    private _selectedSquare: Position | null = null;
    private _boardEnabled: boolean = true;


    public constructor(localPlayer: Player, remotePlayer: Player, game?: Game) {
        this._localPlayer = localPlayer;
        this._remotePlayer = remotePlayer;
        this._ui = new UiRenderer();
        this._game = game ?? GameFactory.fromStartingPosition();
        this.init();
    }

    private init(): void {
        this._ui.render(this._game);
        this._boardEventManager.setupBoardEventListeners(async (file, rank) => {
            if (!this._boardEnabled) return;
            await this.handleSquareClick(file, rank);
        });
        this._controlEventManager.setupControlEventListeners({
            onUndo: () => this.undo(),
            onRedo: () => this.redo(),
            onHome: () => window.location.href = "index.html"
        });
    }

    private async handleSquareClick(file: typeof FILES[number], rank: typeof RANKS[number]): Promise<void> {
        const pos: Position = { x: FILES.indexOf(file), y: rank - 1 };

        if (!this._selectedSquare) {
            this.handleFirstSquareClick(pos, file, rank);
        } else {
            await this.handleSecondSquareClick(pos);
        }
        this._ui.render(this._game);

        if (this._game.status !== "ongoing") {
            this._boardEventManager.removeBoardEventListeners();
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

        if (this.isSelectingSamePiece(fromPiece, toPiece)) {
            this._ui.resetHighlights();
            this._ui.resetSelect();
            this._selectedSquare = null;
        }

        if (this.isSelectingOwnPieceAgain(fromPiece, toPiece)) {
            this.selectNewPiece(toPiece!, to);
            return;
        }

        if (fromPiece) {
            const move: Move = this.buildMoveObject(fromPiece, from, to);
            await this.attemptMove(move);
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

    private async attemptMove(move: Move): Promise<void> {
        const gameClone: Game = this._game.clone();
        if (this._game.makeMove(move)) {
            this._undoStack.push(gameClone);
            this._redoStack = [];
            this._selectedSquare = null;
            this._ui.resetHighlights();
            this._ui.resetSelect();
            this._ui.render(this._game);
            this.updateControlButtons();
            await this.tryBotMove();
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
        this.updateControlButtons();
    }

    public redo(): void {
        if (this._redoStack.length === 0) return;
        this._undoStack.push(this._game.clone());
        this._game = this._redoStack.pop()!;
        this._ui.render(this._game);
        this.updateControlButtons();
    }

    private enableBoard(): void {
        this._boardEnabled = true;
    }

    private disableBoard(): void {
        this._boardEnabled = false;
    }

    private updateControlButtons(): void {
        this._controlEventManager.updateControlButtons(
            this._undoStack.length > 0,
            this._redoStack.length > 0,
            this._game.status === "ongoing"
        );
    }
}