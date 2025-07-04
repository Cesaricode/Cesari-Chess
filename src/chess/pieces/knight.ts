import { Color } from "../types/color.js";
import { PieceType } from "../types/piece-type.js";
import { Position } from "../types/position.js";
import { Piece } from "./piece.js";
import { KNIGHT_DIRECTIONS } from "../constants/directions.js";
import { isWithinBoard } from "../util/board-utils.js";

export class Knight extends Piece {

    public constructor(color: Color, position: Position) {
        super(color, position);
    }

    public getPseudoLegalMoves(): Position[] {
        const returnValue: Position[] = [];

        for (const direction of KNIGHT_DIRECTIONS) {
            const x: number = this.position.x + direction.x;
            const y: number = this.position.y + direction.y;
            if (isWithinBoard({ x, y })) {
                returnValue.push({ x, y });
            }
        }

        return returnValue;
    }

    public get type(): PieceType {
        return PieceType.Knight;
    }

    public clone(): Knight {
        const clone: Knight = new Knight(this.color, { ...this.position });
        clone.setState({ ...this.state });
        return clone;
    }
}