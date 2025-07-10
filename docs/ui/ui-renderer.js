import { FILES, RANKS } from "../chess/constants/board.js";
import { GameFactory } from "../chess/game/game-factory.js";
import { GameStatus } from "../chess/types/game-status.js";
import { moveToSAN } from "../chess/util/move-to-san.js";
export class UiRenderer {
    constructor(statusElementId = "status") {
        const statusEl = document.getElementById(statusElementId);
        if (!statusEl)
            throw new Error("UI status element not found");
        this._statusElement = statusEl;
        const board = document.getElementById("chessBoard");
        if (board) {
            board.addEventListener("contextmenu", (e) => e.preventDefault());
        }
    }
    // Public Methods
    render(game, activeMoveIndex) {
        this.clearBoard();
        this.renderPieces(game);
        this.highlightCheckSquare(game);
        this.renderMoveHistory(game.moveHistory, game, activeMoveIndex);
    }
    renderPlayerNames(whiteName, blackName) {
        const whiteNameEl = document.getElementById('playerWhiteName');
        const blackNameEl = document.getElementById('playerBlackName');
        if (whiteNameEl) {
            whiteNameEl.textContent = `White: ${whiteName}`;
        }
        if (blackNameEl) {
            blackNameEl.textContent = `Black: ${blackName}`;
        }
    }
    renderStatus(status, activeColor) {
        var _a;
        const statusMessages = {
            [GameStatus.WhiteWins]: "White wins by checkmate!",
            [GameStatus.BlackWins]: "Black wins by checkmate!",
            [GameStatus.Stalemate]: "Draw by stalemate.",
            [GameStatus.Draw]: "Draw.",
            [GameStatus.Ongoing]: `${activeColor.charAt(0).toUpperCase() + activeColor.slice(1)} to move.`,
            [GameStatus.WhiteResigns]: "Black won by resignation.",
            [GameStatus.BlackResigns]: "White won by resignation.",
            [GameStatus.Timeout]: "Game ended by timeout.",
            [GameStatus.Abandoned]: "Game ended by abandonment.",
            [GameStatus.InsufficientMaterial]: "Draw by insufficient material.",
            [GameStatus.ThreefoldRepetition]: "Draw by threefold repetition.",
            [GameStatus.FiftyMoveRule]: "Draw by fifty-move rule."
        };
        this._statusElement.textContent = (_a = statusMessages[status]) !== null && _a !== void 0 ? _a : "Game ended.";
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
    resetHighlights() {
        for (const file of FILES) {
            for (const rank of RANKS) {
                this.removeHighlight(`${file}${rank}`);
            }
        }
    }
    resetLastMoveHighlights() {
        for (const file of FILES) {
            for (const rank of RANKS) {
                this.removeLastMoveHighlight(`${file}${rank}`);
            }
        }
    }
    resetSelectHighlights() {
        for (const file of FILES) {
            for (const rank of RANKS) {
                this.removeSelectHighlight(`${file}${rank}`);
            }
        }
    }
    renderMoveHistory(moveHistory, game, activeMoveIndex) {
        const grid = document.getElementById("moveHistoryGrid");
        if (!grid)
            return;
        grid.innerHTML = "";
        const paddingCount = this.getHistoryMovePadding(game);
        let simulatedGame = GameFactory.fromFEN(game.initialFEN);
        const fenParts = game.initialFEN.split(" ");
        const startingColor = fenParts[1];
        let rowNum = 1;
        let pad = paddingCount;
        let moveIndex = 0;
        while (pad > 0) {
            const row = document.createElement("div");
            row.className = "move-history-row";
            const numCell = document.createElement("span");
            numCell.className = "move-history-col move-history-num";
            numCell.textContent = rowNum.toString();
            let whiteCell;
            let blackCell;
            if (pad >= 2) {
                whiteCell = this.createEmptyMoveHistoryCell("move-history-col move-history-white move-history-index-empty");
                blackCell = this.createEmptyMoveHistoryCell("move-history-col move-history-black move-history-index-empty");
                pad -= 2;
            }
            else {
                if (startingColor === "b") {
                    whiteCell = this.createEmptyMoveHistoryCell("move-history-col move-history-white move-history-index-empty");
                    blackCell = this.createMoveHistoryCell(moveHistory[moveIndex], simulatedGame, "move-history-col move-history-black move-history-index", activeMoveIndex === moveIndex);
                    if (moveHistory[moveIndex]) {
                        simulatedGame = simulatedGame.simulateMove(Object.assign(Object.assign({}, moveHistory[moveIndex]), { color: simulatedGame.activeColor }));
                    }
                    moveIndex++;
                }
                else {
                    whiteCell = this.createMoveHistoryCell(moveHistory[moveIndex], simulatedGame, "move-history-col move-history-white move-history-index", activeMoveIndex === moveIndex);
                    if (moveHistory[moveIndex]) {
                        simulatedGame = simulatedGame.simulateMove(Object.assign(Object.assign({}, moveHistory[moveIndex]), { color: simulatedGame.activeColor }));
                    }
                    moveIndex++;
                    blackCell = this.createEmptyMoveHistoryCell("move-history-col move-history-black move-history-index-empty");
                }
                pad = 0;
            }
            row.appendChild(numCell);
            row.appendChild(whiteCell);
            row.appendChild(blackCell);
            if (!(whiteCell.classList.contains("move-history-index-empty") &&
                blackCell.classList.contains("move-history-index-empty"))) {
                grid.appendChild(row);
            }
            rowNum++;
        }
        for (; moveIndex < moveHistory.length; moveIndex += 2) {
            const row = document.createElement("div");
            row.className = "move-history-row";
            const numCell = document.createElement("span");
            numCell.className = "move-history-col move-history-num";
            numCell.textContent = rowNum.toString();
            const whiteMove = moveHistory[moveIndex];
            const blackMove = moveHistory[moveIndex + 1];
            const whiteCell = whiteMove
                ? this.createMoveHistoryCell(whiteMove, simulatedGame, "move-history-col move-history-white move-history-index", activeMoveIndex === moveIndex)
                : this.createEmptyMoveHistoryCell("move-history-col move-history-white move-history-index-empty");
            if (whiteMove) {
                simulatedGame = simulatedGame.simulateMove(Object.assign(Object.assign({}, whiteMove), { color: simulatedGame.activeColor }));
            }
            const blackCell = blackMove
                ? this.createMoveHistoryCell(blackMove, simulatedGame, "move-history-col move-history-black move-history-index", activeMoveIndex === moveIndex + 1)
                : this.createEmptyMoveHistoryCell("move-history-col move-history-black move-history-index-empty");
            if (blackMove) {
                simulatedGame = simulatedGame.simulateMove(Object.assign(Object.assign({}, blackMove), { color: simulatedGame.activeColor }));
            }
            row.appendChild(numCell);
            row.appendChild(whiteCell);
            row.appendChild(blackCell);
            grid.appendChild(row);
            rowNum++;
        }
        this.scrollSelectedMoveIntoView();
    }
    // Helpers
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
    createEmptyMoveHistoryCell(className) {
        const cell = document.createElement("span");
        cell.className = className;
        cell.textContent = "";
        return cell;
    }
    createMoveHistoryCell(move, simulatedGame, className, isSelected) {
        const cell = document.createElement("span");
        cell.className = className;
        if (move) {
            cell.textContent = moveToSAN(simulatedGame, move);
            if (isSelected) {
                cell.classList.add("selected");
            }
        }
        else {
            cell.textContent = "";
        }
        return cell;
    }
    getHistoryMovePadding(game) {
        const fenParts = game.initialFEN.split(" ");
        const startingColor = fenParts[1];
        const startingFullmove = parseInt(fenParts[5], 10);
        let paddingCount = (startingFullmove - 1) * 2;
        if (startingColor === "b")
            paddingCount += 1;
        return paddingCount;
    }
    scrollSelectedMoveIntoView() {
        setTimeout(() => {
            const selected = document.querySelector('.move-history-index.selected');
            const roster = document.querySelector('.move-history-roster');
            if (selected && roster) {
                const selectedRect = selected.getBoundingClientRect();
                const rosterRect = roster.getBoundingClientRect();
                if (selectedRect.top < rosterRect.top || selectedRect.bottom > rosterRect.bottom) {
                    selected.scrollIntoView({ block: "nearest", behavior: "smooth" });
                }
            }
        }, 0);
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
    removeLastMoveHighlight(squareId) {
        const square = document.getElementById(squareId);
        if (square) {
            square.classList.remove("lastmove");
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
}
