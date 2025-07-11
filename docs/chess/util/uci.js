export function parseUciMoveToMoveObject(uci, game) {
    const fromFile = uci[0];
    const fromRank = parseInt(uci[1], 10);
    const toFile = uci[2];
    const toRank = parseInt(uci[3], 10);
    const from = { x: fromFile.charCodeAt(0) - "a".charCodeAt(0), y: fromRank - 1 };
    const to = { x: toFile.charCodeAt(0) - "a".charCodeAt(0), y: toRank - 1 };
    const piece = game.board.getPieceAt(from);
    if (!piece)
        throw new Error(`No piece at ${uci.slice(0, 2)}`);
    const castling = piece.type === "king" &&
        (to.x === 6 || to.x === 2) &&
        (from.y === 0 || from.y === 7);
    const move = {
        from,
        to,
        piece: piece.type,
        color: piece.color,
        castling
    };
    if (uci.length === 5) {
        const promoChar = uci[4].toLowerCase();
        let promotion;
        if (promoChar === "q")
            promotion = "queen";
        else if (promoChar === "r")
            promotion = "rook";
        else if (promoChar === "b")
            promotion = "bishop";
        else if (promoChar === "n")
            promotion = "knight";
        if (promotion)
            move.promotion = promotion;
    }
    return move;
}
