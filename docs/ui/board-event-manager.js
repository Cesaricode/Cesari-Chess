import { FILES, RANKS } from "../chess/constants/board.js";
export class BoardEventManager {
    constructor() {
        this.boardListeners = [];
    }
    setupBoardEventListeners(squareClick) {
        this.removeBoardEventListeners();
        for (const file of FILES) {
            for (const rank of RANKS) {
                const square = document.getElementById(`${file}${rank}`);
                if (square) {
                    const handler = () => squareClick(file, rank);
                    square.addEventListener("click", handler);
                    this.boardListeners.push({ el: square, handler });
                }
            }
        }
    }
    removeBoardEventListeners() {
        for (const { el, handler } of this.boardListeners) {
            el.removeEventListener("click", handler);
        }
        this.boardListeners = [];
    }
}
