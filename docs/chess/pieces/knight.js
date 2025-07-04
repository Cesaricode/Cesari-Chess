import { PieceType } from "../types/piece-type.js";
import { Piece } from "./piece.js";
import { KNIGHT_DIRECTIONS } from "../constants/directions.js";
import { isWithinBoard } from "../util/board-utils.js";
export class Knight extends Piece {
    constructor(color, position) {
        super(color, position);
    }
    getPseudoLegalMoves() {
        const returnValue = [];
        for (const direction of KNIGHT_DIRECTIONS) {
            const x = this.position.x + direction.x;
            const y = this.position.y + direction.y;
            if (isWithinBoard({ x, y })) {
                returnValue.push({ x, y });
            }
        }
        return returnValue;
    }
    get type() {
        return PieceType.Knight;
    }
    clone() {
        const clone = new Knight(this.color, Object.assign({}, this.position));
        clone.setState(Object.assign({}, this.state));
        return clone;
    }
}
