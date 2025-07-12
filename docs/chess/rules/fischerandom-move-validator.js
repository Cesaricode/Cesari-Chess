import { Color } from "../types/color.js";
import { PieceType } from "../types/piece-type.js";
import { BaseMoveValidator } from "./base-move-validator.js";
export class FischerandomMoveValidator extends BaseMoveValidator {
    validateCastleMove(game, move) {
        if (move.castling !== true)
            return false;
        if (game.isKingInCheck(move.color))
            return false;
        const isKingSide = move.to.x === 6;
        const isQueenSide = move.to.x === 2;
        if (!isKingSide && !isQueenSide)
            return false;
        const y = move.from.y;
        if (move.color === Color.White) {
            if (isKingSide && !game.castlingRights.whiteKingSide)
                return false;
            if (!isKingSide && !game.castlingRights.whiteQueenSide)
                return false;
        }
        else {
            if (isKingSide && !game.castlingRights.blackKingSide)
                return false;
            if (!isKingSide && !game.castlingRights.blackQueenSide)
                return false;
        }
        if (isKingSide && move.to.x !== 6)
            return false;
        if (!isKingSide && move.to.x !== 2)
            return false;
        const rookX = isKingSide ? game.rookStartKingsideX : game.rookStartQueensideX;
        const rook = game.board.getPieceAt({ x: rookX, y });
        if (!this.assertValidPiece(rook, PieceType.Rook, move.color))
            return false;
        const kingPath = isKingSide
            ? Array.from({ length: move.to.x - move.from.x }, (_, i) => move.from.x + i + 1)
            : Array.from({ length: move.from.x - move.to.x }, (_, i) => move.from.x - i - 1);
        for (const x of kingPath) {
            const piece = game.board.getPieceAt({ x, y });
            if (piece) {
                const isCastlingRook = piece.type === PieceType.Rook &&
                    piece.color === move.color &&
                    !piece.state.hasMoved &&
                    piece.position.x === rookX &&
                    piece.position.y === y;
                if (!isCastlingRook) {
                    return false;
                }
            }
        }
        for (const x of kingPath) {
            if (!this.isPathSafe(game, { from: move.from, to: { x, y }, piece: PieceType.King, color: move.color, castling: true }))
                return false;
        }
        const rookDestX = isKingSide ? 5 : 3;
        if (rookDestX !== rookX) {
            const rookStep = rookDestX > rookX ? 1 : -1;
            for (let x = rookX + rookStep; x !== rookDestX; x += rookStep) {
                const rookDestPiece = game.board.getPieceAt({ x, y });
                if (rookDestPiece) {
                    if (rookDestPiece.type === PieceType.King && rookDestPiece.color === move.color)
                        continue;
                    if (rookDestPiece.type === PieceType.Rook &&
                        rookDestPiece.color === move.color &&
                        rookDestPiece.position.x === rookX &&
                        rookDestPiece.position.y === y)
                        continue;
                    else
                        return false;
                }
            }
            const rookDestPiece = game.board.getPieceAt({ x: rookDestX, y });
            if (rookDestPiece &&
                !((rookDestPiece.type === PieceType.King && rookDestPiece.color === move.color && move.from.x === rookDestX) ||
                    (rookDestPiece === rook))) {
                return false;
            }
        }
        return true;
    }
}
