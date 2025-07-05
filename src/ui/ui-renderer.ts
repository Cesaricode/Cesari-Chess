import { FILES, RANKS } from "../chess/constants/board.js";
import { Game } from "../chess/game/game.js";
import { Piece } from "../chess/pieces/piece.js";
import { GameStatus } from "../chess/types/game-status.js";

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

    public highlightSquare(squareId: string, type: "highlighted" | "targethighlighted" = "highlighted") {
        const square: HTMLElement | null = document.getElementById(squareId);
        if (square) square.classList.add(type);
    }

    public selectSquare(squareId: string) {
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
        this.resetCheckHighlight();
        const king: Piece | undefined = game.board.getPiecesByColor(game.activeColor).find(p => p.type === "king" && p.isActive());
        if (!king) return;
        if (game.isKingInCheck(king.color)) {
            const file: string = FILES[king.position.x];
            const rank: number = king.position.y + 1;
            const square: HTMLElement | null = document.getElementById(`${file}${rank}`);
            if (square) square.classList.add("checkhighlighted");
        }
    }

    public resetSelect(): void {
        for (const file of FILES) {
            for (const rank of RANKS) {
                this.removeSelect(`${file}${rank}`);
            }
        }
    }

    public removeSelect(squareId: string): void {
        const square: HTMLElement | null = document.getElementById(squareId);
        if (square) {
            square.classList.remove("selected");
        }
    }

    public removeHighlight(squareId: string) {
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

    public resetCheckHighlight(): void {
        for (const file of FILES) {
            for (const rank of RANKS) {
                this.removeCheckHighlight(`${file}${rank}`);
            }
        }
    }

    public removeCheckHighlight(squareId: string): void {
        const square: HTMLElement | null = document.getElementById(squareId);
        if (square) {
            square.classList.remove("checkhighlighted");
        }
    }
}