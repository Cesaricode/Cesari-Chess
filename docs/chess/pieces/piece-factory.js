import { PieceType } from "../types/piece-type.js";
import { Pawn } from "./pawn.js";
import { Queen } from "./queen.js";
import { Rook } from "./rook.js";
import { Bishop } from "./bishop.js";
import { Knight } from "./knight.js";
import { King } from "./king.js";
export class PieceFactory {
    constructor() { }
    static create(type, color, position) {
        const Constructor = this.pieceConstructors[type];
        if (!Constructor)
            throw new Error("Unknown piece type");
        return new Constructor(color, position);
    }
}
PieceFactory.pieceConstructors = {
    [PieceType.Pawn]: Pawn,
    [PieceType.Queen]: Queen,
    [PieceType.Rook]: Rook,
    [PieceType.Bishop]: Bishop,
    [PieceType.Knight]: Knight,
    [PieceType.King]: King,
};
