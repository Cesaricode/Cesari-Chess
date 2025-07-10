import { Board } from "../board/board.js";
import { ChessClock } from "../clock/clock.js";
import { STARTING_FEN } from "../constants/fen.js";
import { FIFTY_MOVE_RULE_LIMIT, FIVEFOLD_REPETITION_COUNT, SEVENTYFIVE_MOVE_RULE_LIMIT, THREEFOLD_REPETITION_COUNT } from "../constants/game.js";
import { King } from "../pieces/king.js";
import { Piece } from "../pieces/piece.js";
import { MoveValidator } from "../rules/move-validator.js";
import { CastlingRights } from "../types/castling-rights.js";
import { Color } from "../types/color.js";
import { GameState } from "../types/game-state.js";
import { GameStatus } from "../types/game-status.js";
import { Move } from "../types/move.js";
import { PieceType } from "../types/piece-type.js";
import { Position } from "../types/position.js";
import { FEN } from "../util/fen.js";

export class Game implements GameState {

    private _board: Board;
    private _clock: ChessClock;
    private _status: GameStatus = GameStatus.Ongoing;
    private _moveHistory: Move[] = [];
    private _positionHistory: Map<string, number> = new Map();
    private _initialFEN: string;

    private _gameState: GameState = {
        activeColor: Color.White,
        enPassantTarget: null,
        halfmoveClock: 0,
        fullmoveNumber: 1,
        castlingRights: {
            whiteKingSide: true,
            whiteQueenSide: true,
            blackKingSide: true,
            blackQueenSide: true,
        }
    };

    public constructor(board?: Board, clock?: ChessClock, fen?: string) {
        this._board = board ?? new Board();
        this._clock = clock ?? new ChessClock();
        this._initialFEN = fen ?? STARTING_FEN;
    }

    public makeMove(move: Move): boolean {
        this.assertOngoing();
        if (!MoveValidator.validateMove(this, move)) {
            return false;
        }

        if (move.color !== this.activeColor) {
            return false;
        }

        this.applyMoveToBoard(move);

        this.updateCastlingRights(move);
        this.updateHalfmoveClock(move);
        this.setEnPassantTarget(move);
        this.updateFullmoveNumber();
        this.updateGameStatus();
        this.switchActiveColor();
        return true;
    }

    private applyMoveToBoard(move: Move): void {
        if (!this.handleSpecialMoves(move)) {
            const captured: Piece | null = this.board.getPieceAt(move.to);
            if (captured) {
                move.capturedPiece = captured.type;
            }
            this.board.movePiece(move.from, move.to);
            this.addToMoveHistory(move);
        }
    }

    private handleSpecialMoves(move: Move): boolean {
        if (this.handleCastling(move)) return true;
        if (this.handleEnPassant(move)) return true;
        if (this.handlePromotion(move)) return true;
        return false;
    }

    private handleCastling(move: Move): boolean {
        if (move.piece === PieceType.King && Math.abs(move.from.x - move.to.x) === 2) {
            const y: number = move.from.y;
            if (move.to.x > move.from.x) {
                this.board.movePiece({ x: 7, y }, { x: 5, y });
            } else {
                this.board.movePiece({ x: 0, y }, { x: 3, y });
            }
            this.board.movePiece(move.from, move.to);
            this.addToMoveHistory(move);
            return true;
        }
        return false;
    }

    private handleEnPassant(move: Move): boolean {
        if (move.piece === PieceType.Pawn && this.enPassantTarget &&
            move.to.x === this.enPassantTarget.x && move.to.y === this.enPassantTarget.y) {
            const dir: number = move.color === Color.White ? -1 : 1;
            const captured: Piece | null = this.board.getPieceAt({ x: move.to.x, y: move.to.y + dir });
            if (captured) {
                move.capturedPiece = captured.type;
                captured.capture();
            }
            this.board.movePiece(move.from, move.to);
            this.addToMoveHistory(move);
            return true;
        }
        return false;
    }

    private handlePromotion(move: Move): boolean {
        if (move.piece === PieceType.Pawn && move.promotion) {
            const promotionRank: number = move.color === Color.White ? 7 : 0;
            if (move.to.y === promotionRank) {
                const captured: Piece | null = this.board.getPieceAt(move.to);
                if (captured) {
                    move.capturedPiece = captured.type;
                }
                this.board.promotePawn(move.from, move.to, move.promotion);
                this.addToMoveHistory(move);
                return true;
            }
        }
        return false;
    }

    private updateCastlingRights(move: Move): void {
        if (move.piece === PieceType.King) {
            if (move.color === Color.White) {
                this.castlingRights.whiteKingSide = false;
                this.castlingRights.whiteQueenSide = false;
            } else {
                this.castlingRights.blackKingSide = false;
                this.castlingRights.blackQueenSide = false;
            }
        }
        if (move.piece === PieceType.Rook) {
            if (move.color === Color.White) {
                if (move.from.x === 0 && move.from.y === 0) this.castlingRights.whiteQueenSide = false;
                if (move.from.x === 7 && move.from.y === 0) this.castlingRights.whiteKingSide = false;
            } else {
                if (move.from.x === 0 && move.from.y === 7) this.castlingRights.blackQueenSide = false;
                if (move.from.x === 7 && move.from.y === 7) this.castlingRights.blackKingSide = false;
            }
        }
        if (move.capturedPiece === PieceType.Rook) {
            if (move.color === Color.White) {
                if (move.to.x === 0 && move.to.y === 7) this.castlingRights.blackQueenSide = false;
                if (move.to.x === 7 && move.to.y === 7) this.castlingRights.blackKingSide = false;
            } else {
                if (move.to.x === 0 && move.to.y === 0) this.castlingRights.whiteQueenSide = false;
                if (move.to.x === 7 && move.to.y === 0) this.castlingRights.whiteKingSide = false;
            }
        }
    }

    private updateHalfmoveClock(move: Move): void {
        if (move.piece === PieceType.Pawn || move.capturedPiece) {
            this.halfmoveClock = 0;
        } else {
            this.halfmoveClock++;
        }
    }

    private updateFullmoveNumber(): void {
        if (this.activeColor === Color.Black) {
            this.fullmoveNumber++;
        }
    }

    private switchActiveColor(): void {
        this.activeColor = this.activeColor === Color.White ? Color.Black : Color.White;
    }

    private setEnPassantTarget(move: Move): void {
        if (
            move.piece === PieceType.Pawn &&
            Math.abs(move.to.y - move.from.y) === 2
        ) {
            this.enPassantTarget = {
                x: move.from.x,
                y: (move.from.y + move.to.y) / 2
            };
        } else {
            this.enPassantTarget = null;
        }
    }

    public addToMoveHistory(move: Move): void {
        this._moveHistory.push(move);
        const fen: string = FEN.getRepetitionFEN(this);
        const count: number = this._positionHistory.get(fen) ?? 0;
        this._positionHistory.set(fen, count + 1);
    }

    private assertOngoing(): void {
        if (this._status !== GameStatus.Ongoing) {
            throw new Error('Can not complete action: game is not ongoing.');
        }
    }

    private updateGameStatus(): void {
        const opponent: Color = this.activeColor === Color.White ? Color.Black : Color.White;
        const isInCheck: boolean = this.isKingInCheck(opponent);
        const hasLegalMoves: boolean = this.hasLegalMoves(opponent);

        if (this.hasInsufficientMaterial()) {
            this._status = GameStatus.InsufficientMaterial;
            return;
        }

        if (this.halfmoveClock >= SEVENTYFIVE_MOVE_RULE_LIMIT) {
            this._status = GameStatus.Draw;
            return;
        }

        if (this.halfmoveClock >= FIFTY_MOVE_RULE_LIMIT) {
            // Todo: set a flag or status for claimable draw
            this._status = GameStatus.Draw;
            return;
        }

        const fen: string = FEN.getRepetitionFEN(this);
        if (this._positionHistory.get(fen) === FIVEFOLD_REPETITION_COUNT) {
            this._status = GameStatus.Draw;
            return;
        }

        if (this._positionHistory.get(fen) === THREEFOLD_REPETITION_COUNT) {
            // Todo: set a flag or status for claimable draw
            this._status = GameStatus.Draw;
            return;
        }

        if (isInCheck && !hasLegalMoves) {
            this._status = this.activeColor === Color.White
                ? GameStatus.WhiteWins
                : GameStatus.BlackWins;
        } else if (!isInCheck && !hasLegalMoves) {
            this._status = GameStatus.Stalemate;
        } else {
            this._status = GameStatus.Ongoing;
        }
    }

    public isKingInCheck(color: Color): boolean {
        const king: King | undefined = this._board.getPiecesByColor(color).find(p => p.type === PieceType.King) as King | undefined;
        if (!king) throw new Error("King not found on the board.");
        const opponent: Color = color === Color.White ? Color.Black : Color.White;
        return MoveValidator.isSquareAttacked(this, king.position, opponent);
    }

    public hasLegalMoves(color: Color): boolean {
        const pieces: Piece[] = this._board.getPiecesByColor(color).filter(p => p.isActive());
        for (const piece of pieces) {
            const pseudoMoves: Position[] = piece.getPseudoLegalMoves();
            for (const to of pseudoMoves) {
                const move: Move = {
                    from: piece.position,
                    to,
                    piece: piece.type,
                    color: piece.color
                };
                if (MoveValidator.validateMove(this, move)) {
                    return true;
                }
            }
            if (piece.type === PieceType.King) {
                const y: number = piece.position.y;
                const castlingTargets = [
                    { x: piece.position.x + 2, y },
                    { x: piece.position.x - 2, y }
                ];
                for (const to of castlingTargets) {
                    const move: Move = {
                        from: piece.position,
                        to,
                        piece: PieceType.King,
                        color: piece.color
                    };
                    if (MoveValidator.validateMove(this, move)) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    private hasInsufficientMaterial(): boolean {
        const pieces: Piece[] = this._board.getAllPieces().filter(p => p.isActive());
        if (pieces.length === 2) return true;

        if (pieces.length === 3) {
            const nonKings: Piece[] = pieces.filter(p => p.type !== PieceType.King);
            if (
                nonKings.length === 1 &&
                (nonKings[0].type === PieceType.Bishop || nonKings[0].type === PieceType.Knight)
            ) {
                return true;
            }
        }

        if (pieces.length === 4) {
            const nonKings: Piece[] = pieces.filter(p => p.type !== PieceType.King);
            if (
                nonKings.length === 2 &&
                nonKings[0].type === PieceType.Bishop &&
                nonKings[1].type === PieceType.Bishop
            ) {
                const sameColor = (pos: Position) => (pos.x + pos.y) % 2;
                if (sameColor(nonKings[0].position) === sameColor(nonKings[1].position)) {
                    return true;
                }
            }
            if (
                nonKings.length === 2 &&
                (
                    (nonKings[0].type === PieceType.Bishop && nonKings[1].type === PieceType.Knight) ||
                    (nonKings[0].type === PieceType.Knight && nonKings[1].type === PieceType.Bishop) ||
                    (nonKings[0].type === PieceType.Knight && nonKings[1].type === PieceType.Knight)
                )
            ) {
                return true;
            }
        }

        return false;
    }

    public clone(): Game {
        const clonedBoard: Board = this._board.clone();
        const clonedClock: ChessClock = this._clock.clone();

        const clonedGame: Game = new Game(clonedBoard, clonedClock, this._initialFEN);

        clonedGame._status = this._status;
        clonedGame._moveHistory = this._moveHistory.map(m => ({ ...m }));

        clonedGame._positionHistory = new Map(this._positionHistory);

        clonedGame._gameState = {
            activeColor: this._gameState.activeColor,
            enPassantTarget: this._gameState.enPassantTarget
                ? { ...this._gameState.enPassantTarget }
                : null,
            halfmoveClock: this._gameState.halfmoveClock,
            fullmoveNumber: this._gameState.fullmoveNumber,
            castlingRights: { ...this._gameState.castlingRights }
        };

        return clonedGame;
    }

    public simulateMove(move: Move): Game {
        const clone: Game = this.clone();
        const moveCopy: Move = { ...move };

        if (!clone.handleSpecialMoves(moveCopy)) {
            const captured: Piece | null = clone.board.getPieceAt(moveCopy.to);
            if (captured) {
                moveCopy.capturedPiece = captured.type;
            }
            clone.board.movePiece(moveCopy.from, moveCopy.to);
            clone.addToMoveHistory(moveCopy);
        }

        clone.updateCastlingRights(moveCopy);
        clone.updateHalfmoveClock(moveCopy);
        clone.setEnPassantTarget(moveCopy);
        clone.updateFullmoveNumber();
        clone.switchActiveColor();

        return clone;
    }

    public isKingInCheckAfterMove(move: Move): boolean {
        const simulated: Game = this.simulateMove(move);
        const opponent: Color = move.color === Color.White ? Color.Black : Color.White;
        return simulated.isKingInCheck(opponent);
    }

    public isKingInCheckmateAfterMove(move: Move): boolean {
        const simulated: Game = this.simulateMove(move);
        const opponent: Color = move.color === Color.White ? Color.Black : Color.White;
        return simulated.isKingInCheck(opponent) && !simulated.hasLegalMoves(opponent);
    }

    public resign(color: Color): void {
        this._status = color === Color.White ? GameStatus.WhiteResigns : GameStatus.BlackResigns;
    }

    public get board(): Board { return this._board; }

    public get clock(): ChessClock { return this._clock; }

    public get status(): GameStatus { return this._status; }

    public get moveHistory(): Move[] { return this._moveHistory; }
    public set moveHistory(value: Move[]) { this._moveHistory = value; }

    public get activeColor(): Color { return this._gameState.activeColor; }
    public set activeColor(value: Color) { this._gameState.activeColor = value; }

    public get castlingRights(): CastlingRights { return this._gameState.castlingRights; }
    public set castlingRights(value: CastlingRights) { this._gameState.castlingRights = value; }

    public get enPassantTarget(): Position | null { return this._gameState.enPassantTarget; }
    public set enPassantTarget(value: Position | null) { this._gameState.enPassantTarget = value; }

    public get halfmoveClock(): number { return this._gameState.halfmoveClock; }
    public set halfmoveClock(value: number) { this._gameState.halfmoveClock = value; }

    public get fullmoveNumber(): number { return this._gameState.fullmoveNumber; }
    public set fullmoveNumber(value: number) { this._gameState.fullmoveNumber = value; }

    public get initialFEN(): string { return this._initialFEN; }
    public set initialFEN(value: string) { this._initialFEN = value; }
}