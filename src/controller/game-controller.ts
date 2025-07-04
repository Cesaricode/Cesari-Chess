import { FILES, RANKS } from "../chess/constants/board.js";
import { GameFactory } from "../chess/game/game-factory.js";
import { Game } from "../chess/game/game.js";
import { Piece } from "../chess/pieces/piece.js";
import { MoveValidator } from "../chess/rules/move-validator.js";
import { Color } from "../chess/types/color.js";
import { Move } from "../chess/types/move.js";
import { Position } from "../chess/types/position.js";
import { Player } from "../player/player.js";
import { UiRenderer } from "../ui/ui-renderer.js";

export class GameController {

    private _game: Game;
    private _ui: UiRenderer;
    private _localPlayer: Player;
    private _remotePlayer: Player;

    private selectedSquare: Position | null = null;

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
    }

    private setupBoardEventListeners(): void {
        for (const file of FILES) {
            for (const rank of RANKS) {
                const square: HTMLElement | null = document.getElementById(`${file}${rank}`);
                if (square) {
                    square.addEventListener("click", () => this.handleSquareClick(file, rank));
                }
            }
        }
    }

    private handleSquareClick(file: typeof FILES[number], rank: typeof RANKS[number]): void {
        const pos: Position = { x: FILES.indexOf(file), y: rank - 1 };

        if (!this.selectedSquare) {
            this.handleFirstSquareClick(pos, file, rank);
        } else {
            this.handleSecondSquareClick(pos);
        }
        this._ui.render(this._game);
    }

    private handleFirstSquareClick(pos: Position, file: typeof FILES[number], rank: typeof RANKS[number]): void {
        this.selectedSquare = pos;
        this._ui.resetHighlights();

        const piece: Piece | null = this._game.board.getPieceAt(pos);
        if (piece && piece.color === this._game.activeColor) {
            this.highlightLegalMoves(piece, pos);
            this._ui.highlightSquare(`${file}${rank}`);
        } else {
            this.selectedSquare = null;
        }
    }

    private handleSecondSquareClick(to: Position): void {
        const from: Position = this.selectedSquare!;
        const fromPiece: Piece | null = this._game.board.getPieceAt(from);
        const toPiece: Piece | null = this._game.board.getPieceAt(to);

        if (
            toPiece &&
            fromPiece &&
            toPiece !== fromPiece &&
            toPiece.color === fromPiece.color &&
            toPiece.color === this._game.activeColor
        ) {
            this.selectedSquare = to;
            this._ui.resetHighlights();
            this.highlightLegalMoves(toPiece, to);

            const targetFile: string = FILES[to.x];
            const targetRank: number = to.y + 1;
            this._ui.highlightSquare(`${targetFile}${targetRank}`);
            return;
        }

        const color: Color | undefined = fromPiece ? fromPiece.color : undefined;
        if (fromPiece && color) {
            const move: Move = { from, to, piece: fromPiece.type, color };
            this._game.makeMove(move);
        }
        this.selectedSquare = null;
        this._ui.resetHighlights();
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
            this._ui.highlightSquare(`${targetFile}${targetRank}`);
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

}