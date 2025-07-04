import { Piece } from "../pieces/piece";
import { PieceFactory } from "../pieces/piece-factory";
import { Color } from "../types/color";
import { PieceType } from "../types/piece-type";

export function createStartingPieces(): Piece[] {

    const pieces: Piece[] = [];

    pieces.push(PieceFactory.create(PieceType.Rook, Color.White, { x: 0, y: 0 }));
    pieces.push(PieceFactory.create(PieceType.Knight, Color.White, { x: 1, y: 0 }));
    pieces.push(PieceFactory.create(PieceType.Bishop, Color.White, { x: 2, y: 0 }));
    pieces.push(PieceFactory.create(PieceType.Queen, Color.White, { x: 3, y: 0 }));
    pieces.push(PieceFactory.create(PieceType.King, Color.White, { x: 4, y: 0 }));
    pieces.push(PieceFactory.create(PieceType.Bishop, Color.White, { x: 5, y: 0 }));
    pieces.push(PieceFactory.create(PieceType.Knight, Color.White, { x: 6, y: 0 }));
    pieces.push(PieceFactory.create(PieceType.Rook, Color.White, { x: 7, y: 0 }));

    for (let x = 0; x < 8; x++) {
        pieces.push(PieceFactory.create(PieceType.Pawn, Color.White, { x, y: 1 }));
    }

    pieces.push(PieceFactory.create(PieceType.Rook, Color.Black, { x: 0, y: 7 }));
    pieces.push(PieceFactory.create(PieceType.Knight, Color.Black, { x: 1, y: 7 }));
    pieces.push(PieceFactory.create(PieceType.Bishop, Color.Black, { x: 2, y: 7 }));
    pieces.push(PieceFactory.create(PieceType.Queen, Color.Black, { x: 3, y: 7 }));
    pieces.push(PieceFactory.create(PieceType.King, Color.Black, { x: 4, y: 7 }));
    pieces.push(PieceFactory.create(PieceType.Bishop, Color.Black, { x: 5, y: 7 }));
    pieces.push(PieceFactory.create(PieceType.Knight, Color.Black, { x: 6, y: 7 }));
    pieces.push(PieceFactory.create(PieceType.Rook, Color.Black, { x: 7, y: 7 }));

    for (let x = 0; x < 8; x++) {
        pieces.push(PieceFactory.create(PieceType.Pawn, Color.Black, { x, y: 6 }));
    }

    return pieces;
}