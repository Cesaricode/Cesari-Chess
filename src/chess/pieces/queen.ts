import { Color } from "../types/color.js";
import { PieceType } from "../types/piece-type.js";
import { Position } from "../types/position.js";
import { Piece } from "./piece.js";
import { QUEEN_DIRECTIONS } from "../constants/directions.js";
import { isWithinBoard } from "../util/board-utils.js";

export class Queen extends Piece {

    public constructor(color: Color, position: Position) {
        super(color, position);
    }

    public getPseudoLegalMoves(): Position[] {
        const returnValue: Position[] = [];

        for (const direction of QUEEN_DIRECTIONS) {
            let x: number = this.position.x + direction.x;
            let y: number = this.position.y + direction.y;
            while (isWithinBoard({ x, y })) {
                returnValue.push({ x, y });
                x += direction.x;
                y += direction.y;
            }
        }

        return returnValue;
    }

    public get type(): PieceType {
        return PieceType.Queen;
    }

    public clone(): Queen {
        const clone: Queen = new Queen(this.color, { ...this.position });
        clone.setState({ ...this.state });
        return clone;
    }
}