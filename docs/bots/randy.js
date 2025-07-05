var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { MoveValidator } from "../chess/rules/move-validator.js";
export function createRandyBot(color) {
    return {
        name: "Randy",
        isBot: true,
        color,
        getMove(game) {
            return __awaiter(this, void 0, void 0, function* () {
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
            });
        }
    };
}
