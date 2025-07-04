import { Board } from "../board/board";
import { ChessClock } from "../clock/clock";
import { Piece } from "../pieces/piece";
import { MoveValidator } from "../rules/move-validator";
import { CastlingRights } from "../types/castling-rights";
import { Color } from "../types/color";
import { GameState } from "../types/game-state";
import { GameStatus } from "../types/game-status";
import { Move } from "../types/move";
import { PieceType } from "../types/piece-type";
import { Position } from "../types/position";

export class Game implements GameState {

    private _board: Board;
    private _clock: ChessClock;
    private _status: GameStatus = GameStatus.Ongoing;
    private _moveHistory: Move[] = [];

    private gameState: GameState = {
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

    public constructor(board?: Board, clock?: ChessClock) {
        this._board = board ?? new Board();
        this._clock = clock ?? new ChessClock();
    }

    public get board(): Board { return this._board; }

    public get clock(): ChessClock { return this._clock; }

    public get status(): GameStatus { return this._status; }

    public get moveHistory(): Move[] { return this._moveHistory; }
    public set moveHistory(value: Move[]) { this._moveHistory = value; }

    public get activeColor(): Color { return this.gameState.activeColor; }
    public set activeColor(value: Color) { this.gameState.activeColor = value; }

    public get castlingRights(): CastlingRights { return this.gameState.castlingRights; }
    public set castlingRights(value: CastlingRights) { this.gameState.castlingRights = value; }

    public get enPassantTarget(): Position | null { return this.gameState.enPassantTarget; }
    public set enPassantTarget(value: Position | null) { this.gameState.enPassantTarget = value; }

    public get halfmoveClock(): number { return this.gameState.halfmoveClock; }
    public set halfmoveClock(value: number) { this.gameState.halfmoveClock = value; }

    public get fullmoveNumber(): number { return this.gameState.fullmoveNumber; }
    public set fullmoveNumber(value: number) { this.gameState.fullmoveNumber = value; }

    private assertOngoing(): void {
        if (this._status !== GameStatus.Ongoing) {
            throw new Error('Can not complete action: game is not ongoing.');
        }
    }

    public clone(): Game {
        const clonedBoard: Board = this._board.clone();
        const clonedClock: ChessClock = this._clock.clone();

        const clonedGame: Game = new Game(clonedBoard, clonedClock);

        clonedGame._status = this._status;
        clonedGame._moveHistory = this._moveHistory.map(m => ({ ...m }));

        clonedGame.gameState = {
            activeColor: this.gameState.activeColor,
            enPassantTarget: this.gameState.enPassantTarget
                ? { ...this.gameState.enPassantTarget }
                : null,
            halfmoveClock: this.gameState.halfmoveClock,
            fullmoveNumber: this.gameState.fullmoveNumber,
            castlingRights: { ...this.gameState.castlingRights }
        };

        return clonedGame;
    }

    public simulateMove(move: Move): Game {
        const clone: Game = this.clone();

        clone.board.movePiece(move.from, move.to);

        const movedPiece: Piece | null = clone.board.getPieceAt(move.to);
        if (movedPiece && movedPiece.type === PieceType.Pawn && Math.abs(move.to.y - move.from.y) === 2) {
            clone.enPassantTarget = { x: move.from.x, y: (move.from.y + move.to.y) / 2 };
        } else {
            clone.enPassantTarget = null;
        }

        if (movedPiece && movedPiece.type === PieceType.King) {
            if (movedPiece.color === Color.White) {
                clone.castlingRights.whiteKingSide = false;
                clone.castlingRights.whiteQueenSide = false;
            } else {
                clone.castlingRights.blackKingSide = false;
                clone.castlingRights.blackQueenSide = false;
            }
        }
        if (movedPiece && movedPiece.type === PieceType.Rook) {
            if (movedPiece.color === Color.White) {
                if (move.from.x === 0 && move.from.y === 0) clone.castlingRights.whiteQueenSide = false;
                if (move.from.x === 7 && move.from.y === 0) clone.castlingRights.whiteKingSide = false;
            } else {
                if (move.from.x === 0 && move.from.y === 7) clone.castlingRights.blackQueenSide = false;
                if (move.from.x === 7 && move.from.y === 7) clone.castlingRights.blackKingSide = false;
            }
        }
        return clone;
    }
}