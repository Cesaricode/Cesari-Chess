import { Piece } from "../pieces/piece.js";
import { PieceFactory } from "../pieces/piece-factory.js";
import { Color } from "../types/color.js";
import { PieceType } from "../types/piece-type.js";
import { getRandomInt } from "../../util/randomint.js";

export function createFischerRandomStartingPieces(): Piece[] {
    const pieces: Piece[] = [];

    const whiteBackRank: PieceType[] = generateFischerRandomBackRank();
    for (let x = 0; x < 8; x++) {
        pieces.push(PieceFactory.create(whiteBackRank[x], Color.White, { x, y: 0 }));
    }

    for (let x = 0; x < 8; x++) {
        pieces.push(PieceFactory.create(PieceType.Pawn, Color.White, { x, y: 1 }));
    }

    for (let x = 0; x < 8; x++) {
        pieces.push(PieceFactory.create(whiteBackRank[x], Color.Black, { x, y: 7 }));
    }

    for (let x = 0; x < 8; x++) {
        pieces.push(PieceFactory.create(PieceType.Pawn, Color.Black, { x, y: 6 }));
    }

    return pieces;
}

function generateFischerRandomBackRank(): PieceType[] {
    const backRank: (PieceType | null)[] = Array(8).fill(null);

    const whiteSquares: number[] = [0, 2, 4, 6];
    const blackSquares: number[] = [1, 3, 5, 7];
    const bishop1: number = whiteSquares[getRandomInt(0, whiteSquares.length - 1)];
    const bishop2: number = blackSquares[getRandomInt(0, blackSquares.length - 1)];
    backRank[bishop1] = PieceType.Bishop;
    backRank[bishop2] = PieceType.Bishop;

    const emptySquares1: number[] = backRank.map((p: PieceType | null, i: number) => p === null ? i : -1).filter((i: number) => i !== -1);
    const queenPos: number = emptySquares1[getRandomInt(0, emptySquares1.length - 1)];
    backRank[queenPos] = PieceType.Queen;

    const emptySquares2: number[] = backRank.map((p: PieceType | null, i: number) => p === null ? i : -1).filter((i: number) => i !== -1);
    const knight1: number = emptySquares2[getRandomInt(0, emptySquares2.length - 1)];
    backRank[knight1] = PieceType.Knight;

    const emptySquares3: number[] = backRank.map((p: PieceType | null, i: number) => p === null ? i : -1).filter((i: number) => i !== -1);
    const knight2: number = emptySquares3[getRandomInt(0, emptySquares3.length - 1)];
    backRank[knight2] = PieceType.Knight;

    const emptySquares4: number[] = backRank.map((p: PieceType | null, i: number) => p === null ? i : -1).filter((i: number) => i !== -1);
    const [a, b, c]: number[] = emptySquares4;
    const permutations: PieceType[][] = [
        [PieceType.Rook, PieceType.King, PieceType.Rook],
        [PieceType.Rook, PieceType.Rook, PieceType.King],
        [PieceType.King, PieceType.Rook, PieceType.Rook]
    ];
    [backRank[a], backRank[b], backRank[c]] = permutations[0];

    return backRank as PieceType[];
}