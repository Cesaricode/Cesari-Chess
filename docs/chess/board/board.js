import { BOARD_HEIGHT, BOARD_WIDTH } from "../constants/board.js";
import { PieceFactory } from "../pieces/piece-factory.js";
import { PieceType } from "../types/piece-type.js";
export class Board {
    constructor() {
        this._grid = [];
        this.setupGrid();
    }
    setupGrid() {
        this._grid = Array.from({ length: BOARD_HEIGHT }, () => Array.from({ length: BOARD_WIDTH }, () => null));
    }
    populateGrid(pieces) {
        this.assertEmpty();
        pieces.forEach(piece => {
            this._grid[piece.position.y][piece.position.x] = piece;
        });
    }
    getPieceAt(position) {
        return this._grid[position.y][position.x];
    }
    setPieceAt(position, piece) {
        this._grid[position.y][position.x] = piece;
    }
    movePiece(from, to) {
        const piece = this.getPieceAt(from);
        if (piece) {
            this.setPieceAt(from, null);
            this.setPieceAt(to, piece);
            piece.moveTo(to);
        }
    }
    promotePawn(from, to, promotion) {
        const pawn = this.getPieceAt(from);
        if (!pawn || pawn.type !== PieceType.Pawn)
            return;
        this.setPieceAt(from, null);
        pawn.promote();
        const promoted = PieceFactory.create(promotion, pawn.color, to);
        promoted.state.hasMoved = true;
        this.setPieceAt(to, promoted);
    }
    getAllPieces() {
        const pieces = [];
        this._grid.forEach(row => {
            row.forEach(square => {
                if (square !== null) {
                    pieces.push(square);
                }
            });
        });
        return pieces;
    }
    getPiecesByColor(color) {
        return this.getAllPieces().filter(piece => piece.color === color);
    }
    assertEmpty() {
        if (this.getAllPieces().length > 0) {
            throw new Error("Can not complete action: board is not empty.");
        }
    }
    clone() {
        const clone = new Board();
        const piecesCopy = this.getAllPieces().map(piece => piece.clone());
        clone.populateGrid(piecesCopy);
        return clone;
    }
    isValidPosition(pos) {
        return pos.x >= 0 && pos.x < BOARD_WIDTH && pos.y >= 0 && pos.y < BOARD_HEIGHT;
    }
    get grid() {
        return this._grid;
    }
}
