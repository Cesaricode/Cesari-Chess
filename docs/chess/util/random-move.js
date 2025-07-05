import { MoveValidator } from "../rules/move-validator.js";
export function getRandomLegalMove(game) {
    const moves = [];
    for (const piece of game.board.getPiecesByColor(game.activeColor)) {
        if (!piece.isActive())
            continue;
        for (const pos of piece.getPseudoLegalMoves()) {
            const move = {
                from: piece.position,
                to: pos,
                piece: piece.type,
                color: piece.color
            };
            if (MoveValidator.validateMove(game, move)) {
                moves.push(move);
            }
        }
    }
    if (moves.length === 0)
        throw new Error("No legal moves available");
    return moves[Math.floor(Math.random() * moves.length)];
}
