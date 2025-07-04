import { Color } from "../types/color.js";
import { PieceType } from "../types/piece-type.js";
export class MoveValidator {
    constructor() { }
    static validateMove(game, move) {
        const validator = MoveValidator.validators[move.piece];
        if (!validator) {
            throw new Error(`Can not validate move. Unknown piece type: ${move.piece}`);
        }
        return (validator(game, move) && !MoveValidator.leavesKingInCheck(game, move));
    }
    static validatePawnMove(game, move) {
        const pawn = game.board.getPieceAt(move.from);
        if (!MoveValidator.assertValidPiece(pawn, PieceType.Pawn, move.color)) {
            return false;
        }
        const target = game.board.getPieceAt(move.to);
        if (!MoveValidator.assertTargetColor(target, move.color)) {
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
        if (dx === 0 && !target) {
            return true;
        }
        return false;
    }
    static validateKnightMove(game, move) {
        const knight = game.board.getPieceAt(move.from);
        if (!MoveValidator.assertValidPiece(knight, PieceType.Knight, move.color)) {
            return false;
        }
        const target = game.board.getPieceAt(move.to);
        if (!MoveValidator.assertTargetColor(target, move.color)) {
            return false;
        }
        const pseudoLegalMoves = knight.getPseudoLegalMoves();
        const isPseudoLegal = pseudoLegalMoves.some(pos => pos.x === move.to.x && pos.y === move.to.y);
        if (!isPseudoLegal) {
            return false;
        }
        return true;
    }
    static validateBishopMove(game, move) {
        const bishop = game.board.getPieceAt(move.from);
        if (!MoveValidator.assertValidPiece(bishop, PieceType.Bishop, move.color)) {
            return false;
        }
        const target = game.board.getPieceAt(move.to);
        if (!MoveValidator.assertTargetColor(target, move.color)) {
            return false;
        }
        const pseudoLegalMoves = bishop.getPseudoLegalMoves();
        const isPseudoLegal = pseudoLegalMoves.some(pos => pos.x === move.to.x && pos.y === move.to.y);
        if (!isPseudoLegal) {
            return false;
        }
        if (!MoveValidator.isPathClear(game, move)) {
            return false;
        }
        return true;
    }
    static validateRookMove(game, move) {
        const rook = game.board.getPieceAt(move.from);
        if (!MoveValidator.assertValidPiece(rook, PieceType.Rook, move.color)) {
            return false;
        }
        const target = game.board.getPieceAt(move.to);
        if (!MoveValidator.assertTargetColor(target, move.color)) {
            return false;
        }
        const pseudoLegalMoves = rook.getPseudoLegalMoves();
        const isPseudoLegal = pseudoLegalMoves.some(pos => pos.x === move.to.x && pos.y === move.to.y);
        if (!isPseudoLegal) {
            return false;
        }
        if (!MoveValidator.isPathClear(game, move)) {
            return false;
        }
        return true;
    }
    static validateQueenMove(game, move) {
        const queen = game.board.getPieceAt(move.from);
        if (!MoveValidator.assertValidPiece(queen, PieceType.Queen, move.color)) {
            return false;
        }
        const target = game.board.getPieceAt(move.to);
        if (!MoveValidator.assertTargetColor(target, move.color)) {
            return false;
        }
        const pseudoLegalMoves = queen.getPseudoLegalMoves();
        const isPseudoLegal = pseudoLegalMoves.some(pos => pos.x === move.to.x && pos.y === move.to.y);
        if (!isPseudoLegal) {
            return false;
        }
        if (!MoveValidator.isPathClear(game, move)) {
            return false;
        }
        return true;
    }
    static validateKingMove(game, move) {
        const king = game.board.getPieceAt(move.from);
        if (!MoveValidator.assertValidPiece(king, PieceType.King, move.color)) {
            return false;
        }
        const target = game.board.getPieceAt(move.to);
        if (!MoveValidator.assertTargetColor(target, move.color)) {
            return false;
        }
        if (Math.abs(move.from.x - move.to.x) === 2) {
            return MoveValidator.validateCastleMove(game, move);
        }
        const pseudoLegalMoves = king.getPseudoLegalMoves();
        const isPseudoLegal = pseudoLegalMoves.some(pos => pos.x === move.to.x && pos.y === move.to.y);
        if (!isPseudoLegal) {
            return false;
        }
        return true;
    }
    static validateCastleMove(game, move) {
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
        if (!MoveValidator.assertValidPiece(rook, PieceType.Rook, move.color))
            return false;
        const step = isKingSide ? 1 : -1;
        for (let x = move.from.x + step; x !== rookX; x += step) {
            if (game.board.getPieceAt({ x, y }))
                return false;
        }
        if (!MoveValidator.isPathSafe(game, { from: move.from, to: move.to, piece: PieceType.King, color: move.color }))
            return false;
        if (game.board.getPieceAt(move.to))
            return false;
        return true;
    }
    static assertValidPiece(piece, expectedType, expectedColor) {
        return !!piece &&
            piece.type === expectedType &&
            piece.color === expectedColor &&
            piece.isActive();
    }
    static assertTargetColor(target, movingColor) {
        return !target || target.color !== movingColor;
    }
    static leavesKingInCheck(game, move) {
        const simulated = game.simulateMove(move);
        const king = simulated.board.getPiecesByColor(move.color).find(p => p.type === PieceType.King);
        if (!king) {
            throw new Error("Programming error. King not found after move simulation");
        }
        const opponentColor = move.color === Color.White ? Color.Black : Color.White;
        return MoveValidator.isSquareAttacked(simulated, king.position, opponentColor);
    }
    static isPathClear(game, move) {
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
    static isPathSafe(game, move) {
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
            if (MoveValidator.isSquareAttacked(game, pos, opponentColor)) {
                return false;
            }
        }
        return true;
    }
    static isSquareAttacked(game, pos, byColor) {
        for (const piece of game.board.getPiecesByColor(byColor)) {
            if (!piece.isActive())
                continue;
            const move = {
                from: piece.position,
                to: pos,
                piece: piece.type,
                color: byColor
            };
            if (piece.type === PieceType.King) {
                const dx = Math.abs(piece.position.x - pos.x);
                const dy = Math.abs(piece.position.y - pos.y);
                if ((dx <= 1 && dy <= 1) && (dx + dy > 0)) {
                    return true;
                }
            }
            else {
                const validator = MoveValidator.validators[piece.type];
                if (validator && validator(game, move)) {
                    return true;
                }
            }
        }
        return false;
    }
}
MoveValidator.validators = {
    pawn: MoveValidator.validatePawnMove,
    knight: MoveValidator.validateKnightMove,
    bishop: MoveValidator.validateBishopMove,
    rook: MoveValidator.validateRookMove,
    queen: MoveValidator.validateQueenMove,
    king: MoveValidator.validateKingMove,
};
