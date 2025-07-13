var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Color } from "../../chess/types/color.js";
import { FEN } from "../../chess/util/fen.js";
import { GameStatus } from "../../chess/types/game-status.js";
import { PieceType } from "../../chess/types/piece-type.js";
export class CesariEngine {
    constructor(options = {}) {
        var _a, _b;
        this.stopSearch = false;
        this.transpositionTable = new Map();
        this.maxDepth = (_a = options.maxDepth) !== null && _a !== void 0 ? _a : 3;
        this.timeLimitMs = (_b = options.timeLimitMs) !== null && _b !== void 0 ? _b : 30000;
        console.log(this.maxDepth);
    }
    findBestMove(game) {
        return __awaiter(this, void 0, void 0, function* () {
            const start = performance.now();
            const legalMoves = this.generateLegalMoves(game).sort((a, b) => this.scoreMove(b, game) - this.scoreMove(a, game));
            if (legalMoves.length === 0)
                throw new Error("Error generating move for Cesari Engine: No legal moves available");
            let bestMove = null;
            let lastBestMove = null;
            const maximizing = game.activeColor === Color.White;
            this.stopSearch = false;
            for (let depth = 1; depth <= this.maxDepth; depth++) {
                if (this.stopSearch)
                    break;
                let bestEval = maximizing ? -Infinity : Infinity;
                bestMove = null;
                for (const move of legalMoves) {
                    if (this.stopSearch)
                        break;
                    const clone = game.clone();
                    clone.makeMove(move);
                    const evalScore = this.search(clone, depth - 1, -Infinity, Infinity, !maximizing, start);
                    if ((maximizing && (bestMove === null || evalScore > bestEval)) ||
                        (!maximizing && (bestMove === null || evalScore < bestEval))) {
                        bestEval = evalScore;
                        bestMove = move;
                    }
                }
                if (!this.stopSearch && bestMove !== null) {
                    lastBestMove = bestMove;
                    console.log(bestMove, "- eval:", bestEval, " - depth:", depth);
                }
                if (performance.now() - start > this.timeLimitMs) {
                    this.stopSearch = true;
                    console.log("timeout in findbestmove");
                    break;
                }
            }
            if (!lastBestMove)
                throw new Error("Error generating legal moves for Cesari Engine: Could not find best move");
            return lastBestMove;
        });
    }
    search(game, depth, alpha, beta, maximizing, startTime) {
        // console.log("search called");
        // console.log(depth);
        // printBoardToConsole(game.board);
        const key = FEN.serializeFullFEN(game);
        const alphaOrig = alpha;
        const ttEntry = this.transpositionTable.get(key);
        let legalMoves = this.generateLegalMoves(game).sort((a, b) => this.scoreMove(b, game) - this.scoreMove(a, game));
        if (ttEntry && ttEntry.bestMove) {
            const idx = legalMoves.findIndex(m => JSON.stringify(m) === JSON.stringify(ttEntry.bestMove));
            if (idx > 0) {
                const [ttMove] = legalMoves.splice(idx, 1);
                legalMoves.unshift(ttMove);
            }
        }
        if (ttEntry && ttEntry.depth >= depth) {
            if (ttEntry.flag === "EXACT")
                return ttEntry.eval;
            if (ttEntry.flag === "LOWERBOUND")
                alpha = Math.max(alpha, ttEntry.eval);
            else if (ttEntry.flag === "UPPERBOUND")
                beta = Math.min(beta, ttEntry.eval);
            if (alpha >= beta)
                return ttEntry.eval;
        }
        if (performance.now() - startTime > this.timeLimitMs) {
            this.stopSearch = true;
            return this.evaluate(game);
        }
        if (depth === 0) {
            return this.quiescence(game, alpha, beta);
        }
        if (game.status !== undefined && game.status !== null && game.status !== "ongoing") {
            return this.evaluate(game);
        }
        if (legalMoves.length === 0) {
            return this.evaluate(game);
        }
        let bestEval = maximizing ? -Infinity : Infinity;
        let bestMove = null;
        for (const move of legalMoves) {
            if (this.stopSearch)
                break;
            const clone = game.clone();
            clone.makeMove(move);
            const evalScore = this.search(clone, depth - 1, alpha, beta, !maximizing, startTime);
            if (maximizing) {
                if (evalScore > bestEval) {
                    bestEval = evalScore;
                    bestMove = move;
                }
                alpha = Math.max(alpha, evalScore);
                if (beta <= alpha)
                    break;
            }
            else {
                if (evalScore < bestEval) {
                    bestEval = evalScore;
                    bestMove = move;
                }
                beta = Math.min(beta, evalScore);
                if (beta <= alpha)
                    break;
            }
        }
        let flag = "EXACT";
        if (bestEval <= alphaOrig)
            flag = "UPPERBOUND";
        else if (bestEval >= beta)
            flag = "LOWERBOUND";
        this.transpositionTable.set(key, { eval: bestEval, depth, flag, bestMove: bestMove !== null && bestMove !== void 0 ? bestMove : undefined });
        return bestEval;
    }
    generateLegalMoves(game) {
        const moves = [];
        for (const piece of game.board.getAllPieces()) {
            if (piece.color !== game.activeColor)
                continue;
            for (const to of piece.getPseudoLegalMoves()) {
                const move = {
                    from: piece.position,
                    to,
                    piece: piece.type,
                    color: piece.color,
                    castling: false // or true if castling
                };
                if (game.moveValidator.validateMove(game, move)) {
                    moves.push(move);
                }
            }
        }
        return moves;
    }
    evaluate(game) {
        if (game.status === GameStatus.WhiteWins)
            return 99999;
        if (game.status === GameStatus.BlackWins)
            return -99999;
        if (game.status !== GameStatus.Ongoing)
            return 0;
        let score = 0;
        for (const piece of game.board.getAllPieces()) {
            let value = this.getPieceValue(piece);
            if (piece.type === "pawn") {
                const file = piece.position.x;
                const rank = piece.position.y;
                if ((file === 3 || file === 4) && (rank === 3 || rank === 4)) {
                    value += 20;
                }
                if ((file === 0 || file === 7) && (game.moveHistory.length < 10)) {
                    value -= 15;
                }
            }
            score += piece.color === Color.White ? value : -value;
        }
        return score;
    }
    getPieceValue(piece) {
        switch (piece.type) {
            case PieceType.Pawn: return 100;
            case PieceType.Knight: return 320;
            case PieceType.Bishop: return 330;
            case PieceType.Rook: return 500;
            case PieceType.Queen: return 900;
            case PieceType.King: return 20000;
            default: return 0;
        }
    }
    scoreMove(move, game) {
        const fromPiece = game.board.getPieceAt(move.from);
        if (!fromPiece)
            throw new Error("Error scoring move in cesari engine: Could not find piece at target location");
        const targetPiece = game.board.getPieceAt(move.to);
        let victimValue = 0;
        if (targetPiece) {
            victimValue = this.getPieceValue(targetPiece);
        }
        const attackerValue = this.getPieceValue(fromPiece);
        let promotionBonus = 0;
        if (move.promotion)
            promotionBonus = 800;
        return (victimValue) * 10 - attackerValue + promotionBonus;
    }
    quiescence(game, alpha, beta) {
        let standPat = this.evaluate(game);
        if (standPat >= beta)
            return beta;
        if (alpha < standPat)
            alpha = standPat;
        const captureMoves = this.generateLegalMoves(game).filter(m => {
            const target = game.board.getPieceAt(m.to);
            return target !== null; // Only captures
        });
        for (const move of captureMoves) {
            const clone = game.clone();
            clone.makeMove(move);
            let score = -this.quiescence(clone, -beta, -alpha);
            if (score >= beta)
                return beta;
            if (score > alpha)
                alpha = score;
        }
        return alpha;
    }
}
