import { Color } from "../types/color.js";
import { PieceType } from "../types/piece-type.js";
import { Position } from "../types/position.js";
import { Piece } from "./piece.js";
import { PAWN_CAPTURE_DIRECTIONS, PAWN_MOVE_DIRECTIONS } from "../constants/directions.js";
import { isWithinBoard } from "../util/board-utils.js";

export class Pawn extends Piece {

    public constructor(color: Color, position: Position) {
        super(color, position);
    }

    public getPseudoLegalMoves(): Position[] {
        const returnValue: Position[] = [];

        for (const direction of PAWN_MOVE_DIRECTIONS[this.color]) {
            const x: number = this.position.x + direction.x;
            const y: number = this.position.y + direction.y;
            if (isWithinBoard({ x, y })) {
                returnValue.push({ x, y });
                if (!this.state.hasMoved && direction.x === 0) {
                    const doubleY: number = this.position.y + 2 * direction.y;
                    const doubleMovePos = { x: this.position.x, y: doubleY };
                    if (isWithinBoard(doubleMovePos)) {
                        returnValue.push(doubleMovePos);
                    }
                }
            }
        }

        for (const direction of PAWN_CAPTURE_DIRECTIONS[this.color]) {
            const x: number = this.position.x + direction.x;
            const y: number = this.position.y + direction.y;
            if (isWithinBoard({ x, y })) {
                returnValue.push({ x, y });
            }
        }
        return returnValue;
    }

    public get type(): PieceType {
        return PieceType.Pawn;
    }

    public clone(): Pawn {
        const clone: Pawn = new Pawn(this.color, { ...this.position });
        clone.setState({ ...this.state });
        return clone;
    }

    public promote(): void {
        this._state.isPromoted = true;
    }
}