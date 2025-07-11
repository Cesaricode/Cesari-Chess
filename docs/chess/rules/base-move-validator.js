import { Color } from "../types/color.js";
import { PieceType } from "../types/piece-type.js";
export class BaseMoveValidator {
    constructor() {
        this.validators = {
            pawn: this.validatePawnMove.bind(this),
            knight: this.validateKnightMove.bind(this),
            bishop: this.validateBishopMove.bind(this),
            rook: this.validateRookMove.bind(this),
            queen: this.validateQueenMove.bind(this),
            king: this.validateKingMove.bind(this),
        };
    }
    validateMove(game, move) {
        const validator = this.validators[move.piece];
        if (!validator) {
            throw new Error(`Can not validate move. Unknown piece type: ${move.piece}`);
        }
        return (validator(game, move) && !this.leavesKingInCheck(game, move));
    }
    isSquareAttacked(game, pos, byColor) {
        for (const piece of game.board.getPiecesByColor(byColor)) {
            if (!piece.isActive())
                continue;
            const move = {
                from: piece.position,
                to: pos,
                piece: piece.type,
                color: byColor,
                castling: false
            };
            if (piece.type === PieceType.King) {
                const dx = Math.abs(piece.position.x - pos.x);
                const dy = Math.abs(piece.position.y - pos.y);
                if ((dx <= 1 && dy <= 1) && (dx + dy > 0)) {
                    return true;
                }
            }
            else {
                const validator = this.validators[piece.type];
                if (validator && validator(game, move)) {
                    return true;
                }
            }
        }
        return false;
    }
    validatePawnMove(game, move) {
        const pawn = game.board.getPieceAt(move.from);
        if (!this.assertValidPiece(pawn, PieceType.Pawn, move.color)) {
            return false;
        }
        const target = game.board.getPieceAt(move.to);
        if (!this.assertTargetColor(target, move.color)) {
            return false;
        }
        const dx = move.to.x - move.from.x;
        const dy = move.to.y - move.from.y;
        const direction = pawn.color === Color.White ? 1 : -1;
        const pseudoLegalMoves = pawn.getPseudoLegalMoves();
        const isPseudoLegal = pseudoLegalMoves.some(pos => pos.x === move.to.x && pos.y === move.to.y);
        if (!isPseudoLegal) {
            return false;
        }
        if (Math.abs(dx) === 1 && dy === direction) {
            if (target) {
                return true;
            }
            if (!target && game.enPassantTarget &&
                move.to.x === game.enPassantTarget.x &&
                move.to.y === game.enPassantTarget.y) {
                return true;
            }
            return false;
        }
        if (dx === 0 && dy === direction && !target) {
            return true;
        }
        if (dx === 0 &&
            dy === 2 * direction &&
            !target) {
            return this.isPathClear(game, move);
        }
        return false;
    }
    validateKnightMove(game, move) {
        const knight = game.board.getPieceAt(move.from);
        if (!this.assertValidPiece(knight, PieceType.Knight, move.color)) {
            return false;
        }
        const target = game.board.getPieceAt(move.to);
        if (!this.assertTargetColor(target, move.color)) {
            return false;
        }
        const pseudoLegalMoves = knight.getPseudoLegalMoves();
        const isPseudoLegal = pseudoLegalMoves.some(pos => pos.x === move.to.x && pos.y === move.to.y);
        if (!isPseudoLegal) {
            return false;
        }
        return true;
    }
    validateBishopMove(game, move) {
        const bishop = game.board.getPieceAt(move.from);
        if (!this.assertValidPiece(bishop, PieceType.Bishop, move.color)) {
            return false;
        }
        const target = game.board.getPieceAt(move.to);
        if (!this.assertTargetColor(target, move.color)) {
            return false;
        }
        const pseudoLegalMoves = bishop.getPseudoLegalMoves();
        const isPseudoLegal = pseudoLegalMoves.some(pos => pos.x === move.to.x && pos.y === move.to.y);
        if (!isPseudoLegal) {
            return false;
        }
        if (!this.isPathClear(game, move)) {
            return false;
        }
        return true;
    }
    validateRookMove(game, move) {
        const rook = game.board.getPieceAt(move.from);
        if (!this.assertValidPiece(rook, PieceType.Rook, move.color)) {
            return false;
        }
        const target = game.board.getPieceAt(move.to);
        if (!this.assertTargetColor(target, move.color)) {
            return false;
        }
        const pseudoLegalMoves = rook.getPseudoLegalMoves();
        const isPseudoLegal = pseudoLegalMoves.some(pos => pos.x === move.to.x && pos.y === move.to.y);
        if (!isPseudoLegal) {
            return false;
        }
        if (!this.isPathClear(game, move)) {
            return false;
        }
        return true;
    }
    validateQueenMove(game, move) {
        const queen = game.board.getPieceAt(move.from);
        if (!this.assertValidPiece(queen, PieceType.Queen, move.color)) {
            return false;
        }
        const target = game.board.getPieceAt(move.to);
        if (!this.assertTargetColor(target, move.color)) {
            return false;
        }
        const pseudoLegalMoves = queen.getPseudoLegalMoves();
        const isPseudoLegal = pseudoLegalMoves.some(pos => pos.x === move.to.x && pos.y === move.to.y);
        if (!isPseudoLegal) {
            return false;
        }
        if (!this.isPathClear(game, move)) {
            return false;
        }
        return true;
    }
    validateKingMove(game, move) {
        const king = game.board.getPieceAt(move.from);
        if (!this.assertValidPiece(king, PieceType.King, move.color)) {
            return false;
        }
        const target = game.board.getPieceAt(move.to);
        if (move.castling) {
            return this.validateCastleMove(game, move);
        }
        if (!this.assertTargetColor(target, move.color)) {
            return false;
        }
        const pseudoLegalMoves = king.getPseudoLegalMoves();
        const isPseudoLegal = pseudoLegalMoves.some(pos => pos.x === move.to.x && pos.y === move.to.y);
        if (!isPseudoLegal) {
            return false;
        }
        return true;
    }
    validateCastleMove(game, move) {
        if (move.castling !== true)
            return false;
        if (game.isKingInCheck(move.color))
            return false;
        const isKingSide = move.to.x > move.from.x;
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
        const rookX = isKingSide ? 7 : 0;
        const rook = game.board.getPieceAt({ x: rookX, y });
        if (!this.assertValidPiece(rook, PieceType.Rook, move.color))
            return false;
        const step = isKingSide ? 1 : -1;
        for (let x = move.from.x + step; x !== rookX; x += step) {
            if (game.board.getPieceAt({ x, y }))
                return false;
        }
        if (!this.isPathSafe(game, { from: move.from, to: move.to, piece: PieceType.King, color: move.color, castling: false }))
            return false;
        if (game.board.getPieceAt(move.to))
            return false;
        return true;
    }
    assertValidPiece(piece, expectedType, expectedColor) {
        return !!piece &&
            piece.type === expectedType &&
            piece.color === expectedColor &&
            piece.isActive();
    }
    assertTargetColor(target, movingColor) {
        return !target || target.color !== movingColor;
    }
    leavesKingInCheck(game, move) {
        const simulated = game.simulateMove(move);
        const king = simulated.board.getPiecesByColor(move.color).find(p => p.type === PieceType.King);
        if (!king) {
            throw new Error("Programming error. King not found after move simulation");
        }
        const opponentColor = move.color === Color.White ? Color.Black : Color.White;
        return this.isSquareAttacked(simulated, king.position, opponentColor);
    }
    isPathClear(game, move) {
        const { from, to } = move;
        const dx = Math.sign(to.x - from.x);
        const dy = Math.sign(to.y - from.y);
        let x = from.x + dx;
        let y = from.y + dy;
        while (x !== to.x || y !== to.y) {
            if (game.board.getPieceAt({ x, y })) {
                return false;
            }
            x += dx;
            y += dy;
        }
        return true;
    }
    isPathSafe(game, move) {
        const path = [];
        const dx = Math.sign(move.to.x - move.from.x);
        const dy = Math.sign(move.to.y - move.from.y);
        let x = move.from.x;
        let y = move.from.y;
        const steps = Math.max(Math.abs(move.to.x - move.from.x), Math.abs(move.to.y - move.from.y));
        for (let i = 0; i <= steps; i++) {
            path.push({ x, y });
            x += dx;
            y += dy;
        }
        const opponentColor = move.color === Color.White ? Color.Black : Color.White;
        for (const pos of path) {
            if (this.isSquareAttacked(game, pos, opponentColor)) {
                return false;
            }
        }
        return true;
    }
}
