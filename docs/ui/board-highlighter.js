import { FILES } from "../chess/constants/board.js";
import { Variant } from "../types/variant.js";
export class BoardHighlighter {
    constructor(ui, moveValidator, variant) {
        this._ui = ui;
        this._moveValidator = moveValidator;
        this._variant = variant;
    }
    resetAllHiglights() {
        this._ui.resetHighlights();
        this._ui.resetSelectHighlights();
    }
    highlightLegalMoves(game, piece, from) {
        const pseudoLegalMoves = piece.getPseudoLegalMoves();
        for (const movePos of pseudoLegalMoves) {
            const move = {
                from,
                to: movePos,
                piece: piece.type,
                color: piece.color,
                castling: false
            };
            if (!this._moveValidator.validateMove(game, move))
                continue;
            const targetFile = FILES[movePos.x];
            const targetRank = movePos.y + 1;
            const targetPiece = game.board.getPieceAt(movePos);
            if (targetPiece && targetPiece.color !== piece.color) {
                this._ui.highlightSquare(`${targetFile}${targetRank}`, "targethighlighted");
            }
            else {
                this._ui.highlightSquare(`${targetFile}${targetRank}`);
            }
        }
        this.higlightLegalCastlingMoves(game, piece, from);
    }
    higlightLegalCastlingMoves(game, piece, from) {
        if (piece.type !== "king")
            return;
        const y = from.y;
        const castlingTargets = this.getCastlingTargets(game, piece, y);
        for (const { to, rook, right } of castlingTargets) {
            const move = {
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
    highlightLastMove(game) {
        const lastMove = game.moveHistory.length > 0
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
    highlightHistoryMove(game, moveIndex) {
        if (moveIndex !== null && moveIndex >= 0 && moveIndex < game.moveHistory.length) {
            const move = game.moveHistory[moveIndex];
            this._ui.highlightLastMove(FILES[move.from.x] + (move.from.y + 1), FILES[move.to.x] + (move.to.y + 1));
        }
        else {
            this._ui.resetLastMoveHighlights();
        }
    }
    getCastlingTargets(game, piece, y) {
        const kingsideRookX = game.rookStartKingsideX;
        const kingsideRookPos = { x: kingsideRookX, y };
        const kingsideCastleTo = { x: 6, y };
        const kingsideRight = piece.color === "white"
            ? game.castlingRights.whiteKingSide
            : game.castlingRights.blackKingSide;
        const queensideRookX = game.rookStartQueensideX;
        const queensideRookPos = { x: queensideRookX, y };
        const queensideCastleTo = { x: 2, y };
        const queensideRight = piece.color === "white"
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
    highlightCastlingSquares(to, rook) {
        if (this._variant === Variant.Standard) {
            const targetFile = FILES[to.x];
            const targetRank = to.y + 1;
            this._ui.highlightSquare(`${targetFile}${targetRank}`);
        }
        const rookFile = FILES[rook.x];
        const rookRank = rook.y + 1;
        this._ui.highlightSquare(`${rookFile}${rookRank}`, "targethighlighted");
    }
}
