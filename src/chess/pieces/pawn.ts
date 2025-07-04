import { Color } from "../types/color";
import { PieceType } from "../types/piecetype";
import { Position } from "../types/position";
import { Piece } from "./piece";
import { PAWN_CAPTURE_DIRECTIONS, PAWN_MOVE_DIRECTIONS } from "../constants/directions";
import { isWithinBoard } from "../util/board-utils";

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
            }

            if (!this.state.hasMoved) {
                const doubleY = y + direction.y;
                if (isWithinBoard({ x, y: doubleY })) {
                    returnValue.push({ x, y: doubleY });
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
}