import { Game } from "../game/game.js";
import { Piece } from "../pieces/piece.js";
import { Move } from "../types/move.js";
import { Position } from "../types/position.js";

export function parseUciMoveToMoveObject(uci: string, game: Game): Move {
    const fromFile: string = uci[0];
    const fromRank: number = parseInt(uci[1], 10);
    const toFile: string = uci[2];
    const toRank: number = parseInt(uci[3], 10);

    const from: Position = { x: fromFile.charCodeAt(0) - "a".charCodeAt(0), y: fromRank - 1 };
    const to: Position = { x: toFile.charCodeAt(0) - "a".charCodeAt(0), y: toRank - 1 };

    const piece: Piece | null = game.board.getPieceAt(from);
    if (!piece) throw new Error(`No piece at ${uci.slice(0, 2)}`);

    const move: Move = {
        from,
        to,
        piece: piece.type,
        color: piece.color
    };

    if (uci.length === 5) {
        const promoChar: string = uci[4].toLowerCase();
        let promotion;
        if (promoChar === "q") promotion = "queen";
        else if (promoChar === "r") promotion = "rook";
        else if (promoChar === "b") promotion = "bishop";
        else if (promoChar === "n") promotion = "knight";
        if (promotion) (move as any).promotion = promotion;
    }
    return move;
}
