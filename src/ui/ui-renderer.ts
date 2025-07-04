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
    }

    public render(game: Game): void {
        this.clearBoard();
        this.renderPieces(game);
        this.renderStatus(game.status, game.activeColor);
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
                square.innerHTML = `<img class="piece ${piece.color} ${piece.type}" src="${this.getPieceIconPath(piece)}" width="60" height="60" draggable="true" />`;
            }
        }
    }

    private getPieceIconPath(piece: Piece): string {
        const colorPrefix = piece.color === "white" ? "w" : "b";
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

    public highlightSquare(squareId: string, type: "highlighted" | "targethighlighted" = "highlighted") {
        const square = document.getElementById(squareId);
        if (square) square.classList.add(type);
    }

    public removeHighlight(squareId: string) {
        const square = document.getElementById(squareId);
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
}