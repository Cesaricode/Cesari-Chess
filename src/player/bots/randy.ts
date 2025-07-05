import { BotPlayer } from "../bot-player.js";
import { Game } from "../../chess/game/game.js";
import { Move } from "../../chess/types/move.js";
import { MoveValidator } from "../../chess/rules/move-validator.js";
import { Color } from "../../chess/types/color.js";

export class RandyBot extends BotPlayer {
    constructor(color: Color) {
        super("Randy", color);
    }

    async getMove(game: Game): Promise<Move> {
        await new Promise(resolve => setTimeout(resolve, 400));
        const moves: Move[] = [];
        for (const piece of game.board.getPiecesByColor(game.activeColor)) {
            if (!piece.isActive()) continue;
            for (const pos of piece.getPseudoLegalMoves()) {
                const move: Move = {
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
        if (moves.length === 0) throw new Error("No legal moves available");
        return moves[Math.floor(Math.random() * moves.length)];

    }
}