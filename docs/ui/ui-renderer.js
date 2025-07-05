import { FILES, RANKS } from "../chess/constants/board.js";
import { GameStatus } from "../chess/types/game-status.js";
export class UiRenderer {
    constructor(statusElementId = "status") {
        const statusEl = document.getElementById(statusElementId);
        if (!statusEl)
            throw new Error("UI status element not found");
        this.statusElement = statusEl;
        const board = document.getElementById("chessBoard");
        if (board) {
            board.addEventListener("contextmenu", (e) => e.preventDefault());
        }
    }
    render(game) {
        this.clearBoard();
        this.renderPieces(game);
        this.renderStatus(game.status, game.activeColor);
        this.highlightCheckSquare(game);
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
                square.innerHTML = `<img class="piece ${piece.color} ${piece.type}" src="${this.getPieceIconPath(piece)}" width="60" height="60" draggable="false" />`;
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
        var _a;
        const statusMessages = {
            [GameStatus.WhiteWins]: "White wins by checkmate!",
            [GameStatus.BlackWins]: "Black wins by checkmate!",
            [GameStatus.Stalemate]: "Draw by stalemate.",
            [GameStatus.Draw]: "Draw.",
            [GameStatus.Ongoing]: `${activeColor.charAt(0).toUpperCase() + activeColor.slice(1)} to move.`,
            [GameStatus.Resignation]: "Game ended by resignation.",
            [GameStatus.Timeout]: "Game ended by timeout.",
            [GameStatus.Abandoned]: "Game ended by abandonment.",
            [GameStatus.InsufficientMaterial]: "Draw by insufficient material.",
            [GameStatus.ThreefoldRepetition]: "Draw by threefold repetition.",
            [GameStatus.FiftyMoveRule]: "Draw by fifty-move rule."
        };
        this.statusElement.textContent = (_a = statusMessages[status]) !== null && _a !== void 0 ? _a : "Game ended.";
    }
    highlightSquare(squareId, type = "highlighted") {
        const square = document.getElementById(squareId);
        if (square)
            square.classList.add(type);
    }
    highlightLastMove(from, to) {
        this.resetLastMoveHighlights();
        const fromSquare = document.getElementById(from);
        const toSquare = document.getElementById(to);
        if (fromSquare && toSquare) {
            fromSquare.classList.add("lastmove");
            toSquare.classList.add("lastmove");
        }
    }
    selectSquare(squareId) {
        for (const file of FILES) {
            for (const rank of RANKS) {
                const sq = document.getElementById(`${file}${rank}`);
                if (sq)
                    sq.classList.remove("selected");
            }
        }
        const square = document.getElementById(squareId);
        if (square)
            square.classList.add("selected");
    }
    highlightCheckSquare(game) {
        this.resetCheckHighlights();
        const king = game.board.getPiecesByColor(game.activeColor).find(p => p.type === "king" && p.isActive());
        if (!king)
            return;
        if (game.isKingInCheck(king.color)) {
            const file = FILES[king.position.x];
            const rank = king.position.y + 1;
            const square = document.getElementById(`${file}${rank}`);
            if (square)
                square.classList.add("checkhighlighted");
        }
    }
    resetSelectHighlights() {
        for (const file of FILES) {
            for (const rank of RANKS) {
                this.removeSelectHighlight(`${file}${rank}`);
            }
        }
    }
    removeSelectHighlight(squareId) {
        const square = document.getElementById(squareId);
        if (square) {
            square.classList.remove("selected");
        }
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
    resetCheckHighlights() {
        for (const file of FILES) {
            for (const rank of RANKS) {
                this.removeCheckHighlight(`${file}${rank}`);
            }
        }
    }
    removeCheckHighlight(squareId) {
        const square = document.getElementById(squareId);
        if (square) {
            square.classList.remove("checkhighlighted");
        }
    }
    resetLastMoveHighlights() {
        for (const file of FILES) {
            for (const rank of RANKS) {
                this.removeLastMoveHighlight(`${file}${rank}`);
            }
        }
    }
    removeLastMoveHighlight(squareId) {
        const square = document.getElementById(squareId);
        if (square) {
            square.classList.remove("lastmove");
        }
    }
}
