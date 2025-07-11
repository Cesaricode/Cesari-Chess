import { Game } from "../game/game.js";
import { Bishop } from "../pieces/bishop.js";
import { King } from "../pieces/king.js";
import { Knight } from "../pieces/knight.js";
import { Pawn } from "../pieces/pawn.js";
import { Piece } from "../pieces/piece.js";
import { Queen } from "../pieces/queen.js";
import { Rook } from "../pieces/rook.js";
import { Color } from "../types/color.js";
import { Move } from "../types/move.js";
import { PieceMoveValidator } from "../types/piece-move-validator.js";
import { PieceType } from "../types/piece-type.js";
import { Position } from "../types/position.js";
import { MoveValidator } from "./move-validator-interface.js";

export class BaseMoveValidator implements MoveValidator {

    private validators: Record<PieceType, PieceMoveValidator>;

    public constructor() {
        this.validators = {
            pawn: this.validatePawnMove.bind(this),
            knight: this.validateKnightMove.bind(this),
            bishop: this.validateBishopMove.bind(this),
            rook: this.validateRookMove.bind(this),
            queen: this.validateQueenMove.bind(this),
            king: this.validateKingMove.bind(this),
        };
    }

    public validateMove(game: Game, move: Move): boolean {
        const validator: PieceMoveValidator | undefined = this.validators[move.piece];
        if (!validator) {
            throw new Error(`Can not validate move. Unknown piece type: ${move.piece}`);
        }
        return (validator(game, move) && !this.leavesKingInCheck(game, move));
    }

    public isSquareAttacked(game: Game, pos: Position, byColor: Color): boolean {
        for (const piece of game.board.getPiecesByColor(byColor)) {
            if (!piece.isActive()) continue;
            const move: Move = {
                from: piece.position,
                to: pos,
                piece: piece.type,
                color: byColor,
                castling: false
            };

            if (piece.type === PieceType.King) {
                const dx: number = Math.abs(piece.position.x - pos.x);
                const dy: number = Math.abs(piece.position.y - pos.y);
                if ((dx <= 1 && dy <= 1) && (dx + dy > 0)) {
                    return true;
                }
            } else {
                const validator: PieceMoveValidator = this.validators[piece.type];
                if (validator && validator(game, move)) {
                    return true;
                }
            }
        }

        return false;
    }

    private validatePawnMove(game: Game, move: Move): boolean {
        const pawn: Pawn | null = game.board.getPieceAt(move.from) as Pawn | null;
        if (!this.assertValidPiece<Pawn>(pawn, PieceType.Pawn, move.color)) {
            return false;
        }

        const target: Piece | null = game.board.getPieceAt(move.to);
        if (!this.assertTargetColor(target, move.color)) {
            return false;
        }

        const dx: number = move.to.x - move.from.x;
        const dy: number = move.to.y - move.from.y;
        const direction: number = pawn.color === Color.White ? 1 : -1;

        const pseudoLegalMoves: Position[] = pawn.getPseudoLegalMoves();
        const isPseudoLegal: boolean = pseudoLegalMoves.some(pos => pos.x === move.to.x && pos.y === move.to.y);
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

        if (
            dx === 0 &&
            dy === 2 * direction &&
            !target
        ) {
            return this.isPathClear(game, move);
        }

        return false;
    }

    private validateKnightMove(game: Game, move: Move): boolean {
        const knight: Knight | null = game.board.getPieceAt(move.from) as Knight | null;
        if (!this.assertValidPiece<Knight>(knight, PieceType.Knight, move.color)) {
            return false;
        }

        const target: Piece | null = game.board.getPieceAt(move.to);
        if (!this.assertTargetColor(target, move.color)) {
            return false;
        }

        const pseudoLegalMoves: Position[] = knight.getPseudoLegalMoves();
        const isPseudoLegal: boolean = pseudoLegalMoves.some(pos => pos.x === move.to.x && pos.y === move.to.y);
        if (!isPseudoLegal) {
            return false;
        }

        return true;
    }

    private validateBishopMove(game: Game, move: Move): boolean {
        const bishop: Bishop | null = game.board.getPieceAt(move.from) as Bishop | null;
        if (!this.assertValidPiece<Bishop>(bishop, PieceType.Bishop, move.color)) {
            return false;
        }

        const target: Piece | null = game.board.getPieceAt(move.to);
        if (!this.assertTargetColor(target, move.color)) {
            return false;
        }

        const pseudoLegalMoves: Position[] = bishop.getPseudoLegalMoves();
        const isPseudoLegal: boolean = pseudoLegalMoves.some(pos => pos.x === move.to.x && pos.y === move.to.y);
        if (!isPseudoLegal) {
            return false;
        }

        if (!this.isPathClear(game, move)) {
            return false;
        }

        return true;
    }

    private validateRookMove(game: Game, move: Move): boolean {
        const rook: Rook | null = game.board.getPieceAt(move.from) as Rook | null;
        if (!this.assertValidPiece<Rook>(rook, PieceType.Rook, move.color)) {
            return false;
        }

        const target: Piece | null = game.board.getPieceAt(move.to);
        if (!this.assertTargetColor(target, move.color)) {
            return false;
        }

        const pseudoLegalMoves: Position[] = rook.getPseudoLegalMoves();
        const isPseudoLegal: boolean = pseudoLegalMoves.some(pos => pos.x === move.to.x && pos.y === move.to.y);
        if (!isPseudoLegal) {
            return false;
        }

        if (!this.isPathClear(game, move)) {
            return false;
        }

        return true;
    }

    private validateQueenMove(game: Game, move: Move): boolean {
        const queen: Queen | null = game.board.getPieceAt(move.from) as Queen | null;
        if (!this.assertValidPiece<Queen>(queen, PieceType.Queen, move.color)) {
            return false;
        }

        const target: Piece | null = game.board.getPieceAt(move.to);
        if (!this.assertTargetColor(target, move.color)) {
            return false;
        }

        const pseudoLegalMoves: Position[] = queen.getPseudoLegalMoves();
        const isPseudoLegal: boolean = pseudoLegalMoves.some(pos => pos.x === move.to.x && pos.y === move.to.y);
        if (!isPseudoLegal) {
            return false;
        }

        if (!this.isPathClear(game, move)) {
            return false;
        }

        return true;
    }

    protected validateKingMove(game: Game, move: Move): boolean {
        const king: King | null = game.board.getPieceAt(move.from) as King | null;
        if (!this.assertValidPiece<King>(king, PieceType.King, move.color)) {
            return false;
        }

        const target: Piece | null = game.board.getPieceAt(move.to);

        if (move.castling) {
            return this.validateCastleMove(game, move);
        }

        if (!this.assertTargetColor(target, move.color)) {
            return false;
        }

        const pseudoLegalMoves: Position[] = king.getPseudoLegalMoves();
        const isPseudoLegal: boolean = pseudoLegalMoves.some(pos => pos.x === move.to.x && pos.y === move.to.y);
        if (!isPseudoLegal) {
            return false;
        }

        return true;
    }

    protected validateCastleMove(game: Game, move: Move): boolean {
        if (move.castling !== true) return false;
        if (game.isKingInCheck(move.color)) return false;
        const isKingSide: boolean = move.to.x > move.from.x;
        const y: number = move.from.y;

        if (move.color === Color.White) {
            if (isKingSide && !game.castlingRights.whiteKingSide) return false;
            if (!isKingSide && !game.castlingRights.whiteQueenSide) return false;
        } else {
            if (isKingSide && !game.castlingRights.blackKingSide) return false;
            if (!isKingSide && !game.castlingRights.blackQueenSide) return false;
        }

        const rookX: 0 | 7 = isKingSide ? 7 : 0;
        const rook: Rook | null = game.board.getPieceAt({ x: rookX, y }) as Rook | null;
        if (!this.assertValidPiece<Rook>(rook, PieceType.Rook, move.color)) return false;

        const step: -1 | 1 = isKingSide ? 1 : -1;
        for (let x = move.from.x + step; x !== rookX; x += step) {
            if (game.board.getPieceAt({ x, y })) return false;
        }

        if (!this.isPathSafe(game, { from: move.from, to: move.to, piece: PieceType.King, color: move.color, castling: false })) return false;

        if (game.board.getPieceAt(move.to)) return false;

        return true;
    }

    protected assertValidPiece<T extends Piece>(
        piece: Piece | null,
        expectedType: PieceType,
        expectedColor: Color
    ): piece is T {
        return !!piece &&
            piece.type === expectedType &&
            piece.color === expectedColor &&
            piece.isActive();
    }

    protected assertTargetColor(target: Piece | null, movingColor: Color): boolean {
        return !target || target.color !== movingColor;
    }

    private leavesKingInCheck(game: Game, move: Move): boolean {

        const simulated: Game = game.simulateMove(move);
        const king: King | undefined = simulated.board.getPiecesByColor(move.color).find(p => p.type === PieceType.King) as King | undefined;
        if (!king) {
            throw new Error("Programming error. King not found after move simulation");
        }

        const opponentColor: Color = move.color === Color.White ? Color.Black : Color.White;
        return this.isSquareAttacked(simulated, king.position, opponentColor);
    }

    protected isPathClear(game: Game, move: Move): boolean {
        const { from, to } = move;
        const dx: number = Math.sign(to.x - from.x);
        const dy: number = Math.sign(to.y - from.y);

        let x: number = from.x + dx;
        let y: number = from.y + dy;

        while (x !== to.x || y !== to.y) {
            if (game.board.getPieceAt({ x, y })) {
                return false;
            }
            x += dx;
            y += dy;
        }

        return true;
    }

    protected isPathSafe(game: Game, move: Move): boolean {
        const path: Position[] = [];
        const dx: number = Math.sign(move.to.x - move.from.x);
        const dy: number = Math.sign(move.to.y - move.from.y);
        let x: number = move.from.x;
        let y: number = move.from.y;

        const steps: number = Math.max(Math.abs(move.to.x - move.from.x), Math.abs(move.to.y - move.from.y));
        for (let i = 0; i <= steps; i++) {
            path.push({ x, y });
            x += dx;
            y += dy;
        }

        const opponentColor: Color = move.color === Color.White ? Color.Black : Color.White;
        for (const pos of path) {
            if (this.isSquareAttacked(game, pos, opponentColor)) {
                return false;
            }
        }

        return true;
    }
}