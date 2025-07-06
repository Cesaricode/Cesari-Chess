import { FILES, RANKS } from "../chess/constants/board.js";
import { Game } from "../chess/game/game.js";
import { Piece } from "../chess/pieces/piece.js";
import { GameStatus } from "../chess/types/game-status.js";
import { Move } from "../chess/types/move.js";
import { moveToAlgebraic } from "../chess/util/move-to-algebraic.js";

export class UiRenderer {
    private statusElement: HTMLElement;

    public constructor(statusElementId: string = "status") {
        const statusEl = document.getElementById(statusElementId);
        if (!statusEl) throw new Error("UI status element not found");
        this.statusElement = statusEl;

        const board = document.getElementById("chessBoard");
        if (board) {
            board.addEventListener("contextmenu", (e) => e.preventDefault());
        }
    }

    public render(game: Game): void {
        this.clearBoard();
        this.renderPieces(game);
        this.renderStatus(game.status, game.activeColor);
        this.highlightCheckSquare(game);
        this.renderMoveHistory(game.moveHistory);
    }

    public clearBoard(): void {
        for (const file of FILES) {
            for (const rank of RANKS) {
                const square = document.getElementById(`${file}${rank}`);
                if (square) square.innerHTML = "";
            }
        }
    }

    public renderPieces(game: Game): void {
        for (const piece of game.board.getAllPieces()) {
            if (!piece.isActive()) continue;
            const { x, y } = piece.position;
            const file = FILES[x];
            const rank = y + 1;
            const square = document.getElementById(`${file}${rank}`);
            if (square) {
                square.innerHTML = `<img class="piece ${piece.color} ${piece.type}" src="${this.getPieceIconPath(piece)}" width="60" height="60" draggable="false" />`;
            }
        }
    }

    private getPieceIconPath(piece: Piece): string {
        const colorPrefix: "w" | "b" = piece.color === "white" ? "w" : "b";
        const typeMap: Record<string, string> = {
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

    public renderStatus(status: GameStatus, activeColor: string): void {
        const statusMessages: Record<GameStatus, string> = {
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

        this.statusElement.textContent = statusMessages[status] ?? "Game ended.";
    }

    public renderMoveHistory(moveHistory: Move[]): void {
        const list: HTMLElement | null = document.getElementById("moveHistoryList");
        if (!list) return;
        list.innerHTML = "";
        for (let i = 0; i < moveHistory.length; i += 2) {
            const li: HTMLElement = document.createElement("li");
            const whiteMove: Move = moveHistory[i];
            const blackMove: Move = moveHistory[i + 1];
            li.textContent = `${moveToAlgebraic(whiteMove)}${blackMove ? " " + moveToAlgebraic(blackMove) : ""}`;
            list.appendChild(li);
        }
    }

    public highlightSquare(squareId: string, type: "highlighted" | "targethighlighted" = "highlighted"): void {
        const square: HTMLElement | null = document.getElementById(squareId);
        if (square) square.classList.add(type);
    }

    public highlightLastMove(from: string, to: string): void {
        this.resetLastMoveHighlights();
        const fromSquare: HTMLElement | null = document.getElementById(from);
        const toSquare: HTMLElement | null = document.getElementById(to);
        if (fromSquare && toSquare) {
            fromSquare.classList.add("lastmove");
            toSquare.classList.add("lastmove");
        }
    }

    public selectSquare(squareId: string): void {
        for (const file of FILES) {
            for (const rank of RANKS) {
                const sq: HTMLElement | null = document.getElementById(`${file}${rank}`);
                if (sq) sq.classList.remove("selected");
            }
        }
        const square: HTMLElement | null = document.getElementById(squareId);
        if (square) square.classList.add("selected");
    }

    public highlightCheckSquare(game: Game): void {
        this.resetCheckHighlights();
        const king: Piece | undefined = game.board.getPiecesByColor(game.activeColor).find(p => p.type === "king" && p.isActive());
        if (!king) return;
        if (game.isKingInCheck(king.color)) {
            const file: string = FILES[king.position.x];
            const rank: number = king.position.y + 1;
            const square: HTMLElement | null = document.getElementById(`${file}${rank}`);
            if (square) square.classList.add("checkhighlighted");
        }
    }

    public resetSelectHighlights(): void {
        for (const file of FILES) {
            for (const rank of RANKS) {
                this.removeSelectHighlight(`${file}${rank}`);
            }
        }
    }

    private removeSelectHighlight(squareId: string): void {
        const square: HTMLElement | null = document.getElementById(squareId);
        if (square) {
            square.classList.remove("selected");
        }
    }

    private removeHighlight(squareId: string): void {
        const square: HTMLElement | null = document.getElementById(squareId);
        if (square) {
            square.classList.remove("highlighted");
            square.classList.remove("targethighlighted");
        }
    }

    public resetHighlights(): void {
        for (const file of FILES) {
            for (const rank of RANKS) {
                this.removeHighlight(`${file}${rank}`);
            }
        }
    }

    private resetCheckHighlights(): void {
        for (const file of FILES) {
            for (const rank of RANKS) {
                this.removeCheckHighlight(`${file}${rank}`);
            }
        }
    }

    private removeCheckHighlight(squareId: string): void {
        const square: HTMLElement | null = document.getElementById(squareId);
        if (square) {
            square.classList.remove("checkhighlighted");
        }
    }

    public resetLastMoveHighlights(): void {
        for (const file of FILES) {
            for (const rank of RANKS) {
                this.removeLastMoveHighlight(`${file}${rank}`);
            }
        }
    }

    private removeLastMoveHighlight(squareId: string): void {
        const square: HTMLElement | null = document.getElementById(squareId);
        if (square) {
            square.classList.remove("lastmove");
        }
    }

    public renderPlayerNames(whiteName: string, blackName: string): void {
        const whiteNameEl: HTMLElement | null = document.getElementById('playerWhiteName');
        const blackNameEl: HTMLElement | null = document.getElementById('playerBlackName');
        if (whiteNameEl) {
            whiteNameEl.textContent = `White: ${whiteName}`;
        }
        if (blackNameEl) {
            blackNameEl.textContent = `Black: ${blackName}`;
        }
    }
}