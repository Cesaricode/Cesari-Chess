import { FILES } from "../chess/constants/board.js";
import { MoveValidator } from "../chess/rules/move-validator.js";
export class BoardHighlighter {
    constructor(ui) {
        this._ui = ui;
    }
    highlightLegalMoves(game, piece, from) {
        const pseudoLegalMoves = piece.getPseudoLegalMoves();
        for (const movePos of pseudoLegalMoves) {
            const move = {
                from,
                to: movePos,
                piece: piece.type,
                color: piece.color
            };
            if (!MoveValidator.validateMove(game, move))
                continue;
            const targetFile = FILES[movePos.x];
            const targetRank = movePos.y + 1;
            const targetPiece = game.board.getPieceAt(movePos);
            if (targetPiece && targetPiece.color !== piece.color) {
                this._ui.highlightSquare(`${targetFile}${targetRank}`, "targethighlighted");
            }
            else {
                this._ui.highlightSquare(`${targetFile}${targetRank}`);
            }
        }
        this.higlightLegalCastlingMoves(game, piece, from);
    }
    higlightLegalCastlingMoves(game, piece, from) {
        if (piece.type === "king") {
            const castlingTargets = [];
            if (piece.color === "white" && from.x === 4 && from.y === 0) {
                castlingTargets.push({ x: 6, y: 0 });
                castlingTargets.push({ x: 2, y: 0 });
            }
            if (piece.color === "black" && from.x === 4 && from.y === 7) {
                castlingTargets.push({ x: 6, y: 7 });
                castlingTargets.push({ x: 2, y: 7 });
            }
            for (const castlePos of castlingTargets) {
                const move = {
                    from,
                    to: castlePos,
                    piece: piece.type,
                    color: piece.color
                };
                if (MoveValidator.validateMove(game, move)) {
                    const targetFile = FILES[castlePos.x];
                    const targetRank = castlePos.y + 1;
                    this._ui.highlightSquare(`${targetFile}${targetRank}`);
                }
            }
        }
    }
    highlightLastMove(game) {
        const lastMove = game.moveHistory.length > 0
            ? game.moveHistory[game.moveHistory.length - 1]
            : null;
        if (!lastMove) {
            this._ui.resetLastMoveHighlights();
            return;
        }
        const fromFile = FILES[lastMove.from.x];
        const fromRank = lastMove.from.y + 1;
        const toFile = FILES[lastMove.to.x];
        const toRank = lastMove.to.y + 1;
        this._ui.highlightLastMove(`${fromFile}${fromRank}`, `${toFile}${toRank}`);
    }
    highlightHistoryMove(game, moveIndex) {
        if (moveIndex !== null && moveIndex >= 0 && moveIndex < game.moveHistory.length) {
            const move = game.moveHistory[moveIndex];
            this._ui.highlightLastMove(FILES[move.from.x] + (move.from.y + 1), FILES[move.to.x] + (move.to.y + 1));
        }
        else {
            this._ui.resetLastMoveHighlights();
        }
    }
}
