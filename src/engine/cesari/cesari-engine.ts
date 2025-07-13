import { Game } from "../../chess/game/game.js";
import { Move } from "../../chess/types/move.js";
import { Color } from "../../chess/types/color.js";
import { Piece } from "../../chess/pieces/piece.js";
import { printBoardToConsole } from "../../chess/util/board-utils.js";
import { FEN } from "../../chess/util/fen.js";
import { GameStatus } from "../../chess/types/game-status.js";
import { PieceType } from "../../chess/types/piece-type.js";

export interface EngineOptions {
    maxDepth?: number;
    timeLimitMs?: number;
}

export interface TTEntry {
    eval: number;
    depth: number;
    flag: "EXACT" | "LOWERBOUND" | "UPPERBOUND";
    bestMove?: Move;
}

export class CesariEngine {
    private maxDepth: number;
    private timeLimitMs: number;
    private stopSearch = false;
    private transpositionTable = new Map<string, TTEntry>();

    constructor(options: EngineOptions = {}) {
        this.maxDepth = options.maxDepth ?? 3;
        this.timeLimitMs = options.timeLimitMs ?? 30000;
        console.log(this.maxDepth);
    }

    public async findBestMove(game: Game): Promise<Move> {
        const start: number = performance.now();
        const legalMoves: Move[] = this.generateLegalMoves(game).sort((a, b) => this.scoreMove(b, game) - this.scoreMove(a, game));
        if (legalMoves.length === 0) throw new Error("Error generating move for Cesari Engine: No legal moves available");

        let bestMove: Move | null = null;
        let lastBestMove: Move | null = null;

        const maximizing: boolean = game.activeColor === Color.White;

        this.stopSearch = false;
        for (let depth = 1; depth <= this.maxDepth; depth++) {
            if (this.stopSearch) break;

            let bestEval: number = maximizing ? -Infinity : Infinity;
            bestMove = null;

            for (const move of legalMoves) {
                if (this.stopSearch) break;
                const clone: Game = game.clone();
                clone.makeMove(move);
                const evalScore: number = this.search(clone, depth - 1, -Infinity, Infinity, !maximizing, start);

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

        if (!lastBestMove) throw new Error("Error generating legal moves for Cesari Engine: Could not find best move");
        return lastBestMove;
    }

    private search(game: Game, depth: number, alpha: number, beta: number, maximizing: boolean, startTime: number): number {
        // console.log("search called");
        // console.log(depth);
        // printBoardToConsole(game.board);

        const key = FEN.serializeFullFEN(game);
        const alphaOrig = alpha;

        const ttEntry = this.transpositionTable.get(key);

        let legalMoves: Move[] = this.generateLegalMoves(game).sort((a, b) => this.scoreMove(b, game) - this.scoreMove(a, game));

        if (ttEntry && ttEntry.bestMove) {
            const idx = legalMoves.findIndex(m => JSON.stringify(m) === JSON.stringify(ttEntry.bestMove));
            if (idx > 0) {
                const [ttMove] = legalMoves.splice(idx, 1);
                legalMoves.unshift(ttMove);
            }
        }

        if (ttEntry && ttEntry.depth >= depth) {
            if (ttEntry.flag === "EXACT") return ttEntry.eval;
            if (ttEntry.flag === "LOWERBOUND") alpha = Math.max(alpha, ttEntry.eval);
            else if (ttEntry.flag === "UPPERBOUND") beta = Math.min(beta, ttEntry.eval);
            if (alpha >= beta) return ttEntry.eval;
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

        let bestEval: number = maximizing ? -Infinity : Infinity;
        let bestMove: Move | null = null;

        for (const move of legalMoves) {
            if (this.stopSearch) break;
            const clone: Game = game.clone();
            clone.makeMove(move);
            const evalScore: number = this.search(clone, depth - 1, alpha, beta, !maximizing, startTime);

            if (maximizing) {
                if (evalScore > bestEval) {
                    bestEval = evalScore;
                    bestMove = move;
                }
                alpha = Math.max(alpha, evalScore);
                if (beta <= alpha) break;
            } else {
                if (evalScore < bestEval) {
                    bestEval = evalScore;
                    bestMove = move;
                }
                beta = Math.min(beta, evalScore);
                if (beta <= alpha) break;
            }
        }

        let flag: "EXACT" | "LOWERBOUND" | "UPPERBOUND" = "EXACT";
        if (bestEval <= alphaOrig) flag = "UPPERBOUND";
        else if (bestEval >= beta) flag = "LOWERBOUND";
        this.transpositionTable.set(key, { eval: bestEval, depth, flag, bestMove: bestMove ?? undefined });

        return bestEval;
    }

    private generateLegalMoves(game: Game): Move[] {
        const moves: Move[] = [];
        for (const piece of game.board.getAllPieces()) {
            if (piece.color !== game.activeColor) continue;
            for (const to of piece.getPseudoLegalMoves()) {
                const move: Move = {
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

    private evaluate(game: Game): number {
        if (game.status === GameStatus.WhiteWins) return 99999;
        if (game.status === GameStatus.BlackWins) return -99999;
        if (game.status !== GameStatus.Ongoing) return 0;

        let score: number = 0;
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

    private getPieceValue(piece: Piece): number {
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

    private scoreMove(move: Move, game: Game): number {
        const fromPiece: Piece | null = game.board.getPieceAt(move.from);
        if (!fromPiece) throw new Error("Error scoring move in cesari engine: Could not find piece at target location");

        const targetPiece: Piece | null = game.board.getPieceAt(move.to);
        let victimValue: number = 0;
        if (targetPiece) {
            victimValue = this.getPieceValue(targetPiece);
        }
        const attackerValue: number = this.getPieceValue(fromPiece);

        let promotionBonus = 0;
        if (move.promotion) promotionBonus = 800;

        return (victimValue) * 10 - attackerValue + promotionBonus;
    }

    private quiescence(game: Game, alpha: number, beta: number): number {
        let standPat = this.evaluate(game);
        if (standPat >= beta) return beta;
        if (alpha < standPat) alpha = standPat;

        const captureMoves = this.generateLegalMoves(game).filter(m => {
            const target = game.board.getPieceAt(m.to);
            return target !== null; // Only captures
        });

        for (const move of captureMoves) {
            const clone = game.clone();
            clone.makeMove(move);
            let score = -this.quiescence(clone, -beta, -alpha);
            if (score >= beta) return beta;
            if (score > alpha) alpha = score;
        }
        return alpha;
    }
}