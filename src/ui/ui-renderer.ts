import { FILES, RANKS } from "../chess/constants/board.js";
import { GameFactory } from "../chess/game/game-factory.js";
import { Game } from "../chess/game/game.js";
import { Piece } from "../chess/pieces/piece.js";
import { GameStatus } from "../chess/types/game-status.js";
import { Move } from "../chess/types/move.js";
import { moveToSAN } from "../chess/util/move-to-san.js";

export class UiRenderer {
    private statusElement: HTMLElement;

    public constructor(statusElementId: string = "status") {
        const statusEl: HTMLElement | null = document.getElementById(statusElementId);
        if (!statusEl) throw new Error("UI status element not found");
        this.statusElement = statusEl;

        const board: HTMLElement | null = document.getElementById("chessBoard");
        if (board) {
            board.addEventListener("contextmenu", (e) => e.preventDefault());
        }
    }

    public render(game: Game, activeMoveIndex: number | null): void {
        this.clearBoard();
        this.renderPieces(game);
        this.highlightCheckSquare(game);
        this.renderMoveHistory(game.moveHistory, game, activeMoveIndex);
    }

    public clearBoard(): void {
        for (const file of FILES) {
            for (const rank of RANKS) {
                const square: HTMLElement | null = document.getElementById(`${file}${rank}`);
                if (square) square.innerHTML = "";
            }
        }
    }

    public renderPieces(game: Game): void {
        for (const piece of game.board.getAllPieces()) {
            if (!piece.isActive()) continue;
            const { x, y } = piece.position;
            const file: typeof FILES[number] = FILES[x];
            const rank: number = y + 1;
            const square: HTMLElement | null = document.getElementById(`${file}${rank}`);
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
        const typeLetter: string = typeMap[piece.type];
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

    public renderMoveHistory(moveHistory: Move[], game: Game, activeMoveIndex: number | null): void {
        const grid: HTMLElement | null = document.getElementById("moveHistoryGrid");
        if (!grid) return;
        grid.innerHTML = "";

        const paddingCount: number = this.getHistoryMovePadding(game);
        let simulatedGame: Game = GameFactory.fromFEN(game.initialFEN);

        const fenParts: string[] = game.initialFEN.split(" ");
        const startingColor: string = fenParts[1];
        let rowNum: number = 1;

        let pad: number = paddingCount;
        let moveIndex: number = 0;

        while (pad > 0) {
            const row: HTMLDivElement = document.createElement("div");
            row.className = "move-history-row";

            const numCell: HTMLSpanElement = document.createElement("span");
            numCell.className = "move-history-col move-history-num";
            numCell.textContent = rowNum.toString();

            let whiteCell: HTMLSpanElement;
            let blackCell: HTMLSpanElement;

            if (pad >= 2) {
                whiteCell = this.createEmptyMoveHistoryCell("move-history-col move-history-white move-history-index-empty");
                blackCell = this.createEmptyMoveHistoryCell("move-history-col move-history-black move-history-index-empty");
                pad -= 2;
            } else {
                if (startingColor === "b") {
                    whiteCell = this.createEmptyMoveHistoryCell("move-history-col move-history-white move-history-index-empty");
                    blackCell = this.createMoveHistoryCell(
                        moveHistory[moveIndex],
                        simulatedGame,
                        "move-history-col move-history-black move-history-index",
                        activeMoveIndex === moveIndex
                    );
                    if (moveHistory[moveIndex]) {
                        simulatedGame = simulatedGame.simulateMove({ ...moveHistory[moveIndex], color: simulatedGame.activeColor });
                    }
                    moveIndex++;
                } else {
                    whiteCell = this.createMoveHistoryCell(
                        moveHistory[moveIndex],
                        simulatedGame,
                        "move-history-col move-history-white move-history-index",
                        activeMoveIndex === moveIndex
                    );
                    if (moveHistory[moveIndex]) {
                        simulatedGame = simulatedGame.simulateMove({ ...moveHistory[moveIndex], color: simulatedGame.activeColor });
                    }
                    moveIndex++;
                    blackCell = this.createEmptyMoveHistoryCell("move-history-col move-history-black move-history-index-empty");
                }
                pad = 0;
            }

            row.appendChild(numCell);
            row.appendChild(whiteCell);
            row.appendChild(blackCell);

            if (
                !(whiteCell.classList.contains("move-history-index-empty") &&
                    blackCell.classList.contains("move-history-index-empty"))
            ) {
                grid.appendChild(row);
            }
            rowNum++;
        }

        for (; moveIndex < moveHistory.length; moveIndex += 2) {
            const row: HTMLDivElement = document.createElement("div");
            row.className = "move-history-row";

            const numCell: HTMLSpanElement = document.createElement("span");
            numCell.className = "move-history-col move-history-num";
            numCell.textContent = rowNum.toString();

            const whiteMove: Move = moveHistory[moveIndex];
            const blackMove: Move = moveHistory[moveIndex + 1];

            const whiteCell: HTMLSpanElement = whiteMove
                ? this.createMoveHistoryCell(
                    whiteMove,
                    simulatedGame,
                    "move-history-col move-history-white move-history-index",
                    activeMoveIndex === moveIndex
                )
                : this.createEmptyMoveHistoryCell("move-history-col move-history-white move-history-index-empty");
            if (whiteMove) {
                simulatedGame = simulatedGame.simulateMove({ ...whiteMove, color: simulatedGame.activeColor });
            }

            const blackCell: HTMLSpanElement = blackMove
                ? this.createMoveHistoryCell(
                    blackMove,
                    simulatedGame,
                    "move-history-col move-history-black move-history-index",
                    activeMoveIndex === moveIndex + 1
                )
                : this.createEmptyMoveHistoryCell("move-history-col move-history-black move-history-index-empty");
            if (blackMove) {
                simulatedGame = simulatedGame.simulateMove({ ...blackMove, color: simulatedGame.activeColor });
            }

            row.appendChild(numCell);
            row.appendChild(whiteCell);
            row.appendChild(blackCell);
            grid.appendChild(row);
            rowNum++;
        }

        this.scrollSelectedMoveIntoView();
    }

    private createEmptyMoveHistoryCell(className: string): HTMLSpanElement {
        const cell: HTMLSpanElement = document.createElement("span");
        cell.className = className;
        cell.textContent = "";
        return cell;
    }

    private createMoveHistoryCell(
        move: Move | undefined,
        simulatedGame: Game,
        className: string,
        isSelected: boolean
    ): HTMLSpanElement {
        const cell: HTMLSpanElement = document.createElement("span");
        cell.className = className;
        if (move) {
            cell.textContent = moveToSAN(simulatedGame, move);
            if (isSelected) {
                cell.classList.add("selected");
            }
        } else {
            cell.textContent = "";
        }
        return cell;
    }

    private getHistoryMovePadding(game: Game): number {
        const fenParts: string[] = game.initialFEN.split(" ");
        const startingColor: string = fenParts[1];
        const startingFullmove: number = parseInt(fenParts[5], 10);
        let paddingCount: number = (startingFullmove - 1) * 2;
        if (startingColor === "b") paddingCount += 1;
        return paddingCount;
    }

    private scrollSelectedMoveIntoView(): void {
        setTimeout(() => {
            const selected: HTMLElement | null = document.querySelector('.move-history-index.selected');
            const roster: HTMLElement | null = document.querySelector('.move-history-roster');
            if (selected && roster) {
                const selectedRect: DOMRect = selected.getBoundingClientRect();
                const rosterRect: DOMRect = roster.getBoundingClientRect();
                if (selectedRect.top < rosterRect.top || selectedRect.bottom > rosterRect.bottom) {
                    selected.scrollIntoView({ block: "nearest", behavior: "smooth" });
                }
            }
        }, 0);
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