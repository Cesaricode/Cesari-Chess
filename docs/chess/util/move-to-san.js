import { PieceType } from "../types/piece-type.js";
import { FILES } from "../constants/board.js";
export function moveToSAN(game, move) {
    if (move.piece === PieceType.King && move.castling === true) {
        return move.to.x === 6 ? "O-O" : "O-O-O";
    }
    const pieceLetter = move.piece === PieceType.Pawn ? "" : pieceTypeToLetter(move.piece);
    const isCapture = !!move.capturedPiece;
    let captureStr = isCapture ? "x" : "";
    let disambiguation = "";
    if (move.piece !== PieceType.Pawn && needsDisambiguation(game, move)) {
        disambiguation = getDisambiguation(game, move);
    }
    let pawnCapturePrefix = "";
    if (move.piece === PieceType.Pawn && isCapture) {
        pawnCapturePrefix = FILES[move.from.x];
    }
    const toSquare = FILES[move.to.x] + (move.to.y + 1);
    let promotion = "";
    if (move.promotion) {
        promotion = "=" + move.promotion.charAt(0).toUpperCase();
    }
    let suffix = "";
    if (game.isKingInCheckmateAfterMove(move))
        suffix = "#";
    else if (game.isKingInCheckAfterMove(move))
        suffix = "+";
    return `${pieceLetter}${disambiguation}${pawnCapturePrefix}${captureStr}${toSquare}${promotion}${suffix}`;
}
function pieceTypeToLetter(type) {
    switch (type) {
        case PieceType.Knight: return "N";
        case PieceType.Bishop: return "B";
        case PieceType.Rook: return "R";
        case PieceType.Queen: return "Q";
        case PieceType.King: return "K";
        default: return "";
    }
}
function needsDisambiguation(game, move) {
    const movingPiece = game.board.getPieceAt(move.from);
    if (!movingPiece)
        return false;
    const color = movingPiece.color;
    const candidates = game.board.getPiecesByColor(color)
        .filter(p => p.type === move.piece &&
        p !== movingPiece &&
        game.moveValidator.validateMove(game, {
            from: p.position,
            to: move.to,
            piece: p.type,
            color: color,
            castling: false
        }));
    return candidates.length > 0;
}
function getDisambiguation(game, move) {
    const movingPiece = game.board.getPieceAt(move.from);
    if (!movingPiece)
        return "";
    const color = movingPiece.color;
    const candidates = game.board.getPiecesByColor(color)
        .filter(p => p.type === move.piece &&
        p !== movingPiece &&
        game.moveValidator.validateMove(game, {
            from: p.position,
            to: move.to,
            piece: p.type,
            color: color,
            castling: false
        }));
    if (candidates.length === 0)
        return "";
    const fromFile = FILES[move.from.x];
    const fromRank = (move.from.y + 1).toString();
    const sameFile = candidates.some(p => p.position.x === move.from.x);
    const sameRank = candidates.some(p => p.position.y === move.from.y);
    if (!sameFile)
        return fromFile;
    if (!sameRank)
        return fromRank;
    return fromFile + fromRank;
}
