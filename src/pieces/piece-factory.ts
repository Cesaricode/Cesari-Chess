import { PieceType } from "../types/piecetype";
import { Color } from "../types/color";
import { Position } from "../types/position";
import { Pawn } from "./pawn";
import { Queen } from "./queen";
import { Rook } from "./rook";
import { Bishop } from "./bishop";
import { Knight } from "./knight";
import { King } from "./king";
import { Piece } from "./piece";
import { PieceConstructor } from "../types/piececonstructor";

const pieceConstructors: Record<PieceType, PieceConstructor> = {
    [PieceType.Pawn]: Pawn,
    [PieceType.Queen]: Queen,
    [PieceType.Rook]: Rook,
    [PieceType.Bishop]: Bishop,
    [PieceType.Knight]: Knight,
    [PieceType.King]: King,
};

export class PieceFactory {

    private constructor() { }

    public static create(type: PieceType, color: Color, position: Position): Piece {
        const Constructor: PieceConstructor = pieceConstructors[type];
        if (!Constructor) throw new Error("Unknown piece type");
        return new Constructor(color, position);
    }
}