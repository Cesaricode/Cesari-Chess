import { Board } from "../board/board";
import { ChessClock } from "../clock/clock";
import { MoveValidator } from "../rules/move-validator";
import { CastlingRights } from "../types/castling-rights";
import { Color } from "../types/color";
import { GameState } from "../types/gamestate";
import { GameStatus } from "../types/gamestatus";
import { Move } from "../types/move";
import { Position } from "../types/position";

export class Game implements GameState {

    private _board: Board;
    private _clock: ChessClock;

    private _status: GameStatus = GameStatus.Ongoing;

    private _moveHistory: Move[] = [];
    private _moveValidator: MoveValidator;

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
        this._moveValidator = new MoveValidator();
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
}