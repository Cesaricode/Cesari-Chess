import { FILES } from "../chess/constants/board.js";
import { Game } from "../chess/game/game.js";
import { Piece } from "../chess/pieces/piece.js";
import { MoveValidator } from "../chess/rules/move-validator.js";
import { Move } from "../chess/types/move.js";
import { Position } from "../chess/types/position.js";
import { UiRenderer } from "./ui-renderer.js";

export class BoardHighlighter {

    private _ui: UiRenderer;

    public constructor(ui: UiRenderer) {
        this._ui = ui;
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
                color: piece.color
            };
            if (!MoveValidator.validateMove(game, move)) continue;
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
        if (piece.type === "king") {
            const castlingTargets: Position[] = [];
            if (piece.color === "white" && from.x === 4 && from.y === 0) {
                castlingTargets.push({ x: 6, y: 0 });
                castlingTargets.push({ x: 2, y: 0 });
            }
            if (piece.color === "black" && from.x === 4 && from.y === 7) {
                castlingTargets.push({ x: 6, y: 7 });
                castlingTargets.push({ x: 2, y: 7 });
            }
            for (const castlePos of castlingTargets) {
                const move: Move = {
                    from,
                    to: castlePos,
                    piece: piece.type,
                    color: piece.color
                };
                if (MoveValidator.validateMove(game, move)) {
                    const targetFile: string = FILES[castlePos.x];
                    const targetRank: number = castlePos.y + 1;
                    this._ui.highlightSquare(`${targetFile}${targetRank}`);
                }
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
}