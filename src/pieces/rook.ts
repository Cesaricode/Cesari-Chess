import { Color } from "../types/color";
import { PieceType } from "../types/piecetype";
import { Position } from "../types/position";
import { Piece } from "./piece";
import { ROOK_DIRECTIONS } from "../constants/directions";
import { isWithinBoard } from "../util/board-utils";

export class Rook extends Piece {

    public constructor(color: Color, position: Position) {
        super(color, position);
    }

    public getPseudoLegalMoves(): Position[] {
        const returnValue: Position[] = [];

        for (const direction of ROOK_DIRECTIONS) {
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
        return PieceType.Rook;
    }

    public copy(): Rook {
        const clone: Rook = new Rook(this.color, { ...this.position });
        clone.setState({ ...this.state });
        return clone;
    }
}