import { BOARD_HEIGHT, BOARD_WIDTH } from "../constants/board";
import { Piece } from "../pieces/piece";
import { Color } from "../types/color";
import { Position } from "../types/position";

export class Board {

    private _grid: (Piece | null)[][] = [];

    public constructor() {
        this.setupGrid();
    }

    private setupGrid(): void {
        this._grid = Array.from({ length: BOARD_HEIGHT }, () =>
            Array.from({ length: BOARD_WIDTH }, () => null)
        );
    }

    public populateGrid(pieces: Piece[]): void {
        this.assertEmpty();
        pieces.forEach(piece => {
            this._grid[piece.position.y][piece.position.x] = piece;
        });
    }

    public getPieceAt(position: Position): Piece | null {
        return this._grid[position.y][position.x];
    }

    public setPieceAt(position: Position, piece: Piece | null): void {
        this._grid[position.y][position.x] = piece;
    }

    public movePiece(from: Position, to: Position): void {
        const piece: Piece | null = this.getPieceAt(from);
        this.setPieceAt(from, null);
        if (piece) {
            piece.moveTo(to);
        }
        this.setPieceAt(to, piece);
    }

    public getAllPieces(): Piece[] {
        const pieces: Piece[] = [];
        this._grid.forEach(row => {
            row.forEach(square => {
                if (square !== null) {
                    pieces.push(square);
                }
            });
        });
        return pieces;
    }

    public getPiecesByColor(color: Color): Piece[] {
        return this.getAllPieces().filter(piece => piece.color === color);
    }

    private assertEmpty(): void {
        if (this.getAllPieces().length > 0) {
            throw new Error("Can not complete action: board is not empty.");
        }
    }

    public clone(): Board {
        const clone: Board = new Board();
        const piecesCopy: Piece[] = this.getAllPieces().map(piece => piece.clone());
        clone.populateGrid(piecesCopy);
        return clone;
    }

    public isValidPosition(pos: Position): boolean {
        return pos.x >= 0 && pos.x < BOARD_WIDTH && pos.y >= 0 && pos.y < BOARD_HEIGHT;
    }

    public get grid(): (Piece | null)[][] {
        return this._grid;
    }
}