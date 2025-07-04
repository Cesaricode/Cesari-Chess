import { FILES, RANKS } from "../chess/constants/board.js";
import { GameStatus } from "../chess/types/game-status.js";
export class UiRenderer {
    constructor(statusElementId = "status") {
        const statusEl = document.getElementById(statusElementId);
        if (!statusEl)
            throw new Error("UI status element not found");
        this.statusElement = statusEl;
    }
    render(game) {
        this.clearBoard();
        this.renderPieces(game);
        this.renderStatus(game.status, game.activeColor);
    }
    clearBoard() {
        for (const file of FILES) {
            for (const rank of RANKS) {
                const square = document.getElementById(`${file}${rank}`);
                if (square)
                    square.innerHTML = "";
            }
        }
    }
    renderPieces(game) {
        for (const piece of game.board.getAllPieces()) {
            if (!piece.isActive())
                continue;
            const { x, y } = piece.position;
            const file = FILES[x];
            const rank = y + 1;
            const square = document.getElementById(`${file}${rank}`);
            if (square) {
                square.innerHTML = `<img class="piece ${piece.color} ${piece.type}" src="${this.getPieceIconPath(piece)}" width="60" height="60" draggable="true" />`;
            }
        }
    }
    getPieceIconPath(piece) {
        const colorPrefix = piece.color === "white" ? "w" : "b";
        const typeMap = {
            king: "K",
            queen: "Q",
            rook: "R",
            bishop: "B",
            knight: "N",
            pawn: "P"
        };
        const typeLetter = typeMap[piece.type];
        return `/icons/${colorPrefix}${typeLetter}.svg`;
    }
    renderStatus(status, activeColor) {
        let statusText = "";
        switch (status) {
            case GameStatus.WhiteWins:
                statusText = "White wins by checkmate!";
                break;
            case GameStatus.BlackWins:
                statusText = "Black wins by checkmate!";
                break;
            case GameStatus.Stalemate:
                statusText = "Draw by stalemate.";
                break;
            case GameStatus.Ongoing:
                statusText = `${activeColor.charAt(0).toUpperCase() + activeColor.slice(1)} to move.`;
                break;
            default:
                statusText = "Game ended.";
        }
        this.statusElement.textContent = statusText;
    }
    highlightSquare(squareId, type = "highlighted") {
        const square = document.getElementById(squareId);
        if (square)
            square.classList.add(type);
    }
    removeHighlight(squareId) {
        const square = document.getElementById(squareId);
        if (square) {
            square.classList.remove("highlighted");
            square.classList.remove("targethighlighted");
        }
    }
    resetHighlights() {
        for (const file of FILES) {
            for (const rank of RANKS) {
                this.removeHighlight(`${file}${rank}`);
            }
        }
    }
}
