import { Color } from "../types/color";
import { PieceState } from "../types/piece-state";
import { PieceType } from "../types/piece-type";
import { Position } from "../types/position";

export abstract class Piece {

    private readonly _color: Color;
    private _position: Position;
    private _state: PieceState = {
        hasMoved: false,
        isCaptured: false,
        isPromoted: false
    };

    public constructor(color: Color, position: Position) {
        this._color = color;
        this._position = position;
    }

    public abstract get type(): PieceType;

    public abstract getPseudoLegalMoves(): Position[];

    public abstract clone(): Piece;

    public isActive(): boolean {
        return !this._state.isCaptured && !this._state.isPromoted;
    }

    public moveTo(position: Position): void {
        this.setPosition(position);
        this._state.hasMoved = true;
    }

    public capture(): void {
        this._state.isCaptured = true;
    }

    public promote(): void {
        this._state.isPromoted = true;
    }

    public get state(): PieceState {
        return { ...this._state };
    }

    public setState(value: PieceState): void {
        this._state = value;
    }

    public get position(): Position {
        return { ...this._position };
    }

    protected setPosition(value: Position): void {
        this._position = value;
    }

    public get color(): Color {
        return this._color;
    }
}