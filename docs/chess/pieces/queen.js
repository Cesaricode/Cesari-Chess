import { PieceType } from "../types/piece-type.js";
import { Piece } from "./piece.js";
import { QUEEN_DIRECTIONS } from "../constants/directions.js";
import { isWithinBoard } from "../util/board-utils.js";
export class Queen extends Piece {
    constructor(color, position) {
        super(color, position);
    }
    getPseudoLegalMoves() {
        const returnValue = [];
        for (const direction of QUEEN_DIRECTIONS) {
            let x = this.position.x + direction.x;
            let y = this.position.y + direction.y;
            while (isWithinBoard({ x, y })) {
                returnValue.push({ x, y });
                x += direction.x;
                y += direction.y;
            }
        }
        return returnValue;
    }
    get type() {
        return PieceType.Queen;
    }
    clone() {
        const clone = new Queen(this.color, Object.assign({}, this.position));
        clone.setState(Object.assign({}, this.state));
        return clone;
    }
}
