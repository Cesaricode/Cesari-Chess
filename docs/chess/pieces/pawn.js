import { PieceType } from "../types/piece-type.js";
import { Piece } from "./piece.js";
import { PAWN_CAPTURE_DIRECTIONS, PAWN_MOVE_DIRECTIONS } from "../constants/directions.js";
import { isWithinBoard } from "../util/board-utils.js";
export class Pawn extends Piece {
    constructor(color, position) {
        super(color, position);
    }
    getPseudoLegalMoves() {
        const returnValue = [];
        for (const direction of PAWN_MOVE_DIRECTIONS[this.color]) {
            const x = this.position.x + direction.x;
            const y = this.position.y + direction.y;
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
            const x = this.position.x + direction.x;
            const y = this.position.y + direction.y;
            if (isWithinBoard({ x, y })) {
                returnValue.push({ x, y });
            }
        }
        return returnValue;
    }
    get type() {
        return PieceType.Pawn;
    }
    clone() {
        const clone = new Pawn(this.color, Object.assign({}, this.position));
        clone.setState(Object.assign({}, this.state));
        return clone;
    }
    promote() {
        this._state.isPromoted = true;
    }
}
