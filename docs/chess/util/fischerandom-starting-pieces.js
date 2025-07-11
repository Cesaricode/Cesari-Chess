import { PieceFactory } from "../pieces/piece-factory.js";
import { Color } from "../types/color.js";
import { PieceType } from "../types/piece-type.js";
import { getRandomInt } from "../../util/randomint.js";
export function createFischerRandomStartingPieces() {
    const pieces = [];
    const whiteBackRank = generateFischerRandomBackRank();
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
function generateFischerRandomBackRank() {
    const backRank = Array(8).fill(null);
    const whiteSquares = [0, 2, 4, 6];
    const blackSquares = [1, 3, 5, 7];
    const bishop1 = whiteSquares[getRandomInt(0, whiteSquares.length - 1)];
    const bishop2 = blackSquares[getRandomInt(0, blackSquares.length - 1)];
    backRank[bishop1] = PieceType.Bishop;
    backRank[bishop2] = PieceType.Bishop;
    const emptySquares1 = backRank.map((p, i) => p === null ? i : -1).filter((i) => i !== -1);
    const queenPos = emptySquares1[getRandomInt(0, emptySquares1.length - 1)];
    backRank[queenPos] = PieceType.Queen;
    const emptySquares2 = backRank.map((p, i) => p === null ? i : -1).filter((i) => i !== -1);
    const knight1 = emptySquares2[getRandomInt(0, emptySquares2.length - 1)];
    backRank[knight1] = PieceType.Knight;
    const emptySquares3 = backRank.map((p, i) => p === null ? i : -1).filter((i) => i !== -1);
    const knight2 = emptySquares3[getRandomInt(0, emptySquares3.length - 1)];
    backRank[knight2] = PieceType.Knight;
    const emptySquares4 = backRank.map((p, i) => p === null ? i : -1).filter((i) => i !== -1);
    const [a, b, c] = emptySquares4;
    const permutations = [
        [PieceType.Rook, PieceType.King, PieceType.Rook],
        [PieceType.Rook, PieceType.Rook, PieceType.King],
        [PieceType.King, PieceType.Rook, PieceType.Rook]
    ];
    [backRank[a], backRank[b], backRank[c]] = permutations[0];
    return backRank;
}
