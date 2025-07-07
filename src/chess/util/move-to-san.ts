import { Game } from "../game/game.js";
import { Move } from "../types/move.js";
import { PieceType } from "../types/piece-type.js";
import { FILES, RANKS } from "../constants/board.js";
import { MoveValidator } from "../rules/move-validator.js";
import { Piece } from "../pieces/piece.js";
import { Color } from "../types/color.js";

export function moveToSAN(game: Game, move: Move): string {
    if (move.piece === PieceType.King && Math.abs(move.from.x - move.to.x) === 2) {
        return move.to.x === 6 ? "O-O" : "O-O-O";
    }

    const pieceLetter: string = move.piece === PieceType.Pawn ? "" : pieceTypeToLetter(move.piece);

    const isCapture: boolean = !!move.capturedPiece;
    let captureStr: string = isCapture ? "x" : "";

    let disambiguation: string = "";
    if (move.piece !== PieceType.Pawn && needsDisambiguation(game, move)) {
        disambiguation = getDisambiguation(game, move);
    }

    let pawnCapturePrefix: string = "";
    if (move.piece === PieceType.Pawn && isCapture) {
        pawnCapturePrefix = FILES[move.from.x];
    }

    const toSquare: string = FILES[move.to.x] + (move.to.y + 1);

    let promotion: string = "";
    if (move.promotion) {
        promotion = "=" + move.promotion.charAt(0).toUpperCase();
    }

    let suffix: string = "";
    if (game.isKingInCheckmateAfterMove(move)) suffix = "#";
    else if (game.isKingInCheckAfterMove(move)) suffix = "+";

    return `${pieceLetter}${disambiguation}${pawnCapturePrefix}${captureStr}${toSquare}${promotion}${suffix}`;
}

function pieceTypeToLetter(type: PieceType): string {
    switch (type) {
        case PieceType.Knight: return "N";
        case PieceType.Bishop: return "B";
        case PieceType.Rook: return "R";
        case PieceType.Queen: return "Q";
        case PieceType.King: return "K";
        default: return "";
    }
}

function needsDisambiguation(game: Game, move: Move): boolean {
    const movingPiece: Piece | null = game.board.getPieceAt(move.from);
    if (!movingPiece) return false;
    const color: Color = movingPiece.color;

    const candidates: Piece[] = game.board.getPiecesByColor(color)
        .filter(p =>
            p.type === move.piece &&
            p !== movingPiece &&
            MoveValidator.validateMove(game, {
                from: p.position,
                to: move.to,
                piece: p.type,
                color: color
            })
        );
    return candidates.length > 0;
}

function getDisambiguation(game: Game, move: Move): string {
    const movingPiece: Piece | null = game.board.getPieceAt(move.from);
    if (!movingPiece) return "";
    const color: Color = movingPiece.color;

    const candidates: Piece[] = game.board.getPiecesByColor(color)
        .filter(p =>
            p.type === move.piece &&
            p !== movingPiece &&
            MoveValidator.validateMove(game, {
                from: p.position,
                to: move.to,
                piece: p.type,
                color: color
            })
        );

    if (candidates.length === 0) return "";

    const fromFile: typeof FILES[number] = FILES[move.from.x];
    const fromRank: string = (move.from.y + 1).toString();

    const sameFile: boolean = candidates.some(p => p.position.x === move.from.x);
    const sameRank: boolean = candidates.some(p => p.position.y === move.from.y);

    if (!sameFile) return fromFile;
    if (!sameRank) return fromRank;
    return fromFile + fromRank;
}