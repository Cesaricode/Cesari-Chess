import { FILES } from "../chess/constants/board.js";
import { Game } from "../chess/game/game.js";
import { Piece } from "../chess/pieces/piece.js";
import { MoveValidator } from "../chess/rules/move-validator-interface.js";
import { CastlingTarget } from "../chess/types/castling-target.js";
import { Move } from "../chess/types/move.js";
import { Position } from "../chess/types/position.js";
import { Variant } from "../types/variant.js";
import { UiRenderer } from "./ui-renderer.js";

export class BoardHighlighter {

    private _ui: UiRenderer;
    private _moveValidator: MoveValidator;
    private _variant: Variant;

    public constructor(ui: UiRenderer, moveValidator: MoveValidator, variant: Variant) {
        this._ui = ui;
        this._moveValidator = moveValidator;
        this._variant = variant;
    }

    public resetAllHiglights(): void {
        this._ui.resetHighlights();
        this._ui.resetSelectHighlights();
    }

    public highlightLegalMoves(game: Game, piece: Piece, from: Position): void {
        const pseudoLegalMoves: Position[] = piece.getPseudoLegalMoves();
        for (const movePos of pseudoLegalMoves) {
            const move: Move = {
                from,
                to: movePos,
                piece: piece.type,
                color: piece.color,
                castling: false
            };
            if (!this._moveValidator.validateMove(game, move)) continue;
            const targetFile: string = FILES[movePos.x];
            const targetRank: number = movePos.y + 1;
            const targetPiece: Piece | null = game.board.getPieceAt(movePos);
            if (targetPiece && targetPiece.color !== piece.color) {
                this._ui.highlightSquare(`${targetFile}${targetRank}`, "targethighlighted");
            } else {
                this._ui.highlightSquare(`${targetFile}${targetRank}`);
            }
        }

        this.higlightLegalCastlingMoves(game, piece, from);
    }

    public higlightLegalCastlingMoves(game: Game, piece: Piece, from: Position): void {
        if (piece.type !== "king") return;

        const y: number = from.y;
        const castlingTargets: CastlingTarget[] = this.getCastlingTargets(game, piece, y);

        for (const { to, rook, right } of castlingTargets) {
            const move: Move = {
                from,
                to,
                piece: piece.type,
                color: piece.color,
                castling: true
            };
            if (right && this._moveValidator.validateMove(game, move)) {
                this.highlightCastlingSquares(to, rook);
            }
        }
    }

    public highlightLastMove(game: Game,): void {
        const lastMove: Move | null = game.moveHistory.length > 0
            ? game.moveHistory[game.moveHistory.length - 1]
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

    public highlightHistoryMove(game: Game, moveIndex: number | null): void {
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

    private getCastlingTargets(game: Game, piece: Piece, y: number): CastlingTarget[] {
        const kingsideRookX: number = game.rookStartKingsideX;
        const kingsideRookPos: Position = { x: kingsideRookX, y };
        const kingsideCastleTo: Position = { x: 6, y };
        const kingsideRight: boolean = piece.color === "white"
            ? game.castlingRights.whiteKingSide
            : game.castlingRights.blackKingSide;

        const queensideRookX: number = game.rookStartQueensideX;
        const queensideRookPos: Position = { x: queensideRookX, y };
        const queensideCastleTo: Position = { x: 2, y };
        const queensideRight: boolean = piece.color === "white"
            ? game.castlingRights.whiteQueenSide
            : game.castlingRights.blackQueenSide;

        return [
            {
                to: kingsideCastleTo,
                rook: kingsideRookPos,
                right: kingsideRight,
                side: "kingside"
            },
            {
                to: queensideCastleTo,
                rook: queensideRookPos,
                right: queensideRight,
                side: "queenside"
            }
        ];
    }

    private highlightCastlingSquares(to: Position, rook: Position): void {
        if (this._variant === Variant.Standard) {
            const targetFile: string = FILES[to.x];
            const targetRank: number = to.y + 1;
            this._ui.highlightSquare(`${targetFile}${targetRank}`);
        }

        const rookFile: string = FILES[rook.x];
        const rookRank: number = rook.y + 1;
        this._ui.highlightSquare(`${rookFile}${rookRank}`, "targethighlighted");
    }
}