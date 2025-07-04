import { PieceType } from "../types/piece-type.js";
import { Color } from "../types/color.js";
import { Position } from "../types/position.js";
import { Pawn } from "./pawn.js";
import { Queen } from "./queen.js";
import { Rook } from "./rook.js";
import { Bishop } from "./bishop.js";
import { Knight } from "./knight.js";
import { King } from "./king.js";
import { Piece } from "./piece.js";
import { PieceConstructor } from "../types/piece-constructor.js";

export class PieceFactory {

    private constructor() { }

    private static pieceConstructors: Record<PieceType, PieceConstructor> = {
        [PieceType.Pawn]: Pawn,
        [PieceType.Queen]: Queen,
        [PieceType.Rook]: Rook,
        [PieceType.Bishop]: Bishop,
        [PieceType.Knight]: Knight,
        [PieceType.King]: King,
    };

    public static create(type: PieceType, color: Color, position: Position): Piece {
        const Constructor: PieceConstructor = this.pieceConstructors[type];
        if (!Constructor) throw new Error("Unknown piece type");
        return new Constructor(color, position);
    }
}