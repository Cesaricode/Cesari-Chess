import { FILES, RANKS } from "../chess/constants/board.js";

type SquareClickHandler = (file: typeof FILES[number], rank: typeof RANKS[number]) => void;

interface BoardListener {
    el: HTMLElement;
    handler: EventListener;
}

export class BoardEventManager {

    private boardListeners: BoardListener[] = [];

    public constructor() {

    }

    public setupBoardEventListeners(squareClick: SquareClickHandler): void {
        this.removeBoardEventListeners();
        for (const file of FILES) {
            for (const rank of RANKS) {
                const square: HTMLElement | null = document.getElementById(`${file}${rank}`);
                if (square) {
                    const handler = () => squareClick(file, rank);
                    square.addEventListener("click", handler);
                    this.boardListeners.push({ el: square, handler });
                }
            }
        }
    }

    public removeBoardEventListeners(): void {
        for (const { el, handler } of this.boardListeners) {
            el.removeEventListener("click", handler);
        }
        this.boardListeners = [];
    }
}