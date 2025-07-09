import { Board } from "../board/board.js";
import { ChessClock } from "../clock/clock.js";
import { STARTING_FEN } from "../constants/fen.js";
import { FIFTY_MOVE_RULE_LIMIT, FIVEFOLD_REPETITION_COUNT, SEVENTYFIVE_MOVE_RULE_LIMIT, THREEFOLD_REPETITION_COUNT } from "../constants/game.js";
import { MoveValidator } from "../rules/move-validator.js";
import { Color } from "../types/color.js";
import { GameStatus } from "../types/game-status.js";
import { PieceType } from "../types/piece-type.js";
import { FEN } from "../util/fen.js";
export class Game {
    constructor(board, clock, fen) {
        this._status = GameStatus.Ongoing;
        this._moveHistory = [];
        this._positionHistory = new Map();
        this._gameState = {
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
        this._board = board !== null && board !== void 0 ? board : new Board();
        this._clock = clock !== null && clock !== void 0 ? clock : new ChessClock();
        this._initialFEN = fen !== null && fen !== void 0 ? fen : STARTING_FEN;
    }
    makeMove(move) {
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
    applyMoveToBoard(move) {
        if (!this.handleSpecialMoves(move)) {
            const captured = this.board.getPieceAt(move.to);
            if (captured) {
                move.capturedPiece = captured.type;
            }
            this.board.movePiece(move.from, move.to);
            this.addToMoveHistory(move);
        }
    }
    handleSpecialMoves(move) {
        if (this.handleCastling(move))
            return true;
        if (this.handleEnPassant(move))
            return true;
        if (this.handlePromotion(move))
            return true;
        return false;
    }
    handleCastling(move) {
        if (move.piece === PieceType.King && Math.abs(move.from.x - move.to.x) === 2) {
            const y = move.from.y;
            if (move.to.x > move.from.x) {
                this.board.movePiece({ x: 7, y }, { x: 5, y });
            }
            else {
                this.board.movePiece({ x: 0, y }, { x: 3, y });
            }
            this.board.movePiece(move.from, move.to);
            this.addToMoveHistory(move);
            return true;
        }
        return false;
    }
    handleEnPassant(move) {
        if (move.piece === PieceType.Pawn && this.enPassantTarget &&
            move.to.x === this.enPassantTarget.x && move.to.y === this.enPassantTarget.y) {
            const dir = move.color === Color.White ? -1 : 1;
            const captured = this.board.getPieceAt({ x: move.to.x, y: move.to.y + dir });
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
    handlePromotion(move) {
        if (move.piece === PieceType.Pawn && move.promotion) {
            const promotionRank = move.color === Color.White ? 7 : 0;
            if (move.to.y === promotionRank) {
                const captured = this.board.getPieceAt(move.to);
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
    updateCastlingRights(move) {
        if (move.piece === PieceType.King) {
            if (move.color === Color.White) {
                this.castlingRights.whiteKingSide = false;
                this.castlingRights.whiteQueenSide = false;
            }
            else {
                this.castlingRights.blackKingSide = false;
                this.castlingRights.blackQueenSide = false;
            }
        }
        if (move.piece === PieceType.Rook) {
            if (move.color === Color.White) {
                if (move.from.x === 0 && move.from.y === 0)
                    this.castlingRights.whiteQueenSide = false;
                if (move.from.x === 7 && move.from.y === 0)
                    this.castlingRights.whiteKingSide = false;
            }
            else {
                if (move.from.x === 0 && move.from.y === 7)
                    this.castlingRights.blackQueenSide = false;
                if (move.from.x === 7 && move.from.y === 7)
                    this.castlingRights.blackKingSide = false;
            }
        }
        if (move.capturedPiece === PieceType.Rook) {
            if (move.color === Color.White) {
                if (move.to.x === 0 && move.to.y === 7)
                    this.castlingRights.blackQueenSide = false;
                if (move.to.x === 7 && move.to.y === 7)
                    this.castlingRights.blackKingSide = false;
            }
            else {
                if (move.to.x === 0 && move.to.y === 0)
                    this.castlingRights.whiteQueenSide = false;
                if (move.to.x === 7 && move.to.y === 0)
                    this.castlingRights.whiteKingSide = false;
            }
        }
    }
    updateHalfmoveClock(move) {
        if (move.piece === PieceType.Pawn || move.capturedPiece) {
            this.halfmoveClock = 0;
        }
        else {
            this.halfmoveClock++;
        }
    }
    updateFullmoveNumber() {
        if (this.activeColor === Color.Black) {
            this.fullmoveNumber++;
        }
    }
    switchActiveColor() {
        this.activeColor = this.activeColor === Color.White ? Color.Black : Color.White;
    }
    setEnPassantTarget(move) {
        if (move.piece === PieceType.Pawn &&
            Math.abs(move.to.y - move.from.y) === 2) {
            this.enPassantTarget = {
                x: move.from.x,
                y: (move.from.y + move.to.y) / 2
            };
        }
        else {
            this.enPassantTarget = null;
        }
    }
    addToMoveHistory(move) {
        var _a;
        this._moveHistory.push(move);
        const fen = FEN.getRepetitionFEN(this);
        const count = (_a = this._positionHistory.get(fen)) !== null && _a !== void 0 ? _a : 0;
        this._positionHistory.set(fen, count + 1);
    }
    assertOngoing() {
        if (this._status !== GameStatus.Ongoing) {
            throw new Error('Can not complete action: game is not ongoing.');
        }
    }
    updateGameStatus() {
        const opponent = this.activeColor === Color.White ? Color.Black : Color.White;
        const isInCheck = this.isKingInCheck(opponent);
        const hasLegalMoves = this.hasLegalMoves(opponent);
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
        const fen = FEN.getRepetitionFEN(this);
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
        }
        else if (!isInCheck && !hasLegalMoves) {
            this._status = GameStatus.Stalemate;
        }
        else {
            this._status = GameStatus.Ongoing;
        }
    }
    isKingInCheck(color) {
        const king = this._board.getPiecesByColor(color).find(p => p.type === PieceType.King);
        if (!king)
            throw new Error("King not found on the board.");
        const opponent = color === Color.White ? Color.Black : Color.White;
        return MoveValidator.isSquareAttacked(this, king.position, opponent);
    }
    hasLegalMoves(color) {
        const pieces = this._board.getPiecesByColor(color).filter(p => p.isActive());
        for (const piece of pieces) {
            const pseudoMoves = piece.getPseudoLegalMoves();
            for (const to of pseudoMoves) {
                const move = {
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
                const y = piece.position.y;
                const castlingTargets = [
                    { x: piece.position.x + 2, y },
                    { x: piece.position.x - 2, y }
                ];
                for (const to of castlingTargets) {
                    const move = {
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
    hasInsufficientMaterial() {
        const pieces = this._board.getAllPieces().filter(p => p.isActive());
        if (pieces.length === 2)
            return true; // Only kings
        if (pieces.length === 3) {
            const nonKings = pieces.filter(p => p.type !== PieceType.King);
            if (nonKings.length === 1 &&
                (nonKings[0].type === PieceType.Bishop || nonKings[0].type === PieceType.Knight)) {
                return true;
            }
        }
        if (pieces.length === 4) {
            const nonKings = pieces.filter(p => p.type !== PieceType.King);
            if (nonKings.length === 2 &&
                nonKings[0].type === PieceType.Bishop &&
                nonKings[1].type === PieceType.Bishop) {
                const sameColor = (pos) => (pos.x + pos.y) % 2;
                if (sameColor(nonKings[0].position) === sameColor(nonKings[1].position)) {
                    return true;
                }
            }
            if (nonKings.length === 2 &&
                ((nonKings[0].type === PieceType.Bishop && nonKings[1].type === PieceType.Knight) ||
                    (nonKings[0].type === PieceType.Knight && nonKings[1].type === PieceType.Bishop) ||
                    (nonKings[0].type === PieceType.Knight && nonKings[1].type === PieceType.Knight))) {
                return true;
            }
        }
        return false;
    }
    clone() {
        const clonedBoard = this._board.clone();
        const clonedClock = this._clock.clone();
        const clonedGame = new Game(clonedBoard, clonedClock, this._initialFEN);
        clonedGame._status = this._status;
        clonedGame._moveHistory = this._moveHistory.map(m => (Object.assign({}, m)));
        clonedGame._positionHistory = new Map(this._positionHistory);
        clonedGame._gameState = {
            activeColor: this._gameState.activeColor,
            enPassantTarget: this._gameState.enPassantTarget
                ? Object.assign({}, this._gameState.enPassantTarget) : null,
            halfmoveClock: this._gameState.halfmoveClock,
            fullmoveNumber: this._gameState.fullmoveNumber,
            castlingRights: Object.assign({}, this._gameState.castlingRights)
        };
        return clonedGame;
    }
    simulateMove(move) {
        const clone = this.clone();
        const moveCopy = Object.assign({}, move);
        if (!clone.handleSpecialMoves(moveCopy)) {
            const captured = clone.board.getPieceAt(moveCopy.to);
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
    isKingInCheckAfterMove(move) {
        const simulated = this.simulateMove(move);
        const opponent = move.color === Color.White ? Color.Black : Color.White;
        return simulated.isKingInCheck(opponent);
    }
    isKingInCheckmateAfterMove(move) {
        const simulated = this.simulateMove(move);
        const opponent = move.color === Color.White ? Color.Black : Color.White;
        return simulated.isKingInCheck(opponent) && !simulated.hasLegalMoves(opponent);
    }
    resign(color) {
        this._status = color === Color.White ? GameStatus.WhiteResigns : GameStatus.BlackResigns;
    }
    get board() { return this._board; }
    get clock() { return this._clock; }
    get status() { return this._status; }
    get moveHistory() { return this._moveHistory; }
    set moveHistory(value) { this._moveHistory = value; }
    get activeColor() { return this._gameState.activeColor; }
    set activeColor(value) { this._gameState.activeColor = value; }
    get castlingRights() { return this._gameState.castlingRights; }
    set castlingRights(value) { this._gameState.castlingRights = value; }
    get enPassantTarget() { return this._gameState.enPassantTarget; }
    set enPassantTarget(value) { this._gameState.enPassantTarget = value; }
    get halfmoveClock() { return this._gameState.halfmoveClock; }
    set halfmoveClock(value) { this._gameState.halfmoveClock = value; }
    get fullmoveNumber() { return this._gameState.fullmoveNumber; }
    set fullmoveNumber(value) { this._gameState.fullmoveNumber = value; }
    get initialFEN() { return this._initialFEN; }
    set initialFEN(value) { this._initialFEN = value; }
}
