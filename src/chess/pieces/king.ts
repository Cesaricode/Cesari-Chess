import { Color } from "../types/color";
import { PieceType } from "../types/piecetype";
import { Position } from "../types/position";
import { Piece } from "./piece";
import { KING_DIRECTIONS } from "../constants/directions";
import { isWithinBoard } from "../util/board-utils";

export class King extends Piece {

    public constructor(color: Color, position: Position) {
        super(color, position);
    }

    public getPseudoLegalMoves(): Position[] {
        const returnValue: Position[] = [];

        for (const direction of KING_DIRECTIONS) {
            const x: number = this.position.x + direction.x;
            const y: number = this.position.y + direction.y;
            if (isWithinBoard({ x, y })) {
                returnValue.push({ x, y });
            }
        }

        return returnValue;
    }

    public get type(): PieceType {
        return PieceType.King;
    }

    public clone(): King {
        const clone: King = new King(this.color, { ...this.position });
        clone.setState({ ...this.state });
        return clone;
    }
}