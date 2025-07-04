import { BOARD_HEIGHT, BOARD_WIDTH } from "../constants/board.js";
import { Pawn } from "../pieces/pawn.js";
import { Piece } from "../pieces/piece.js";
import { PieceFactory } from "../pieces/piece-factory.js";
import { Color } from "../types/color.js";
import { PieceType } from "../types/piece-type.js";
import { Position } from "../types/position.js";

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
        if (piece) {
            this.setPieceAt(from, null);
            this.setPieceAt(to, piece);
            piece.moveTo(to);
        }
    }

    public promotePawn(from: Position, to: Position, promotion: PieceType): void {
        const pawn: Pawn | null = this.getPieceAt(from) as Pawn | null;
        if (!pawn || pawn.type !== PieceType.Pawn) return;

        this.setPieceAt(from, null);
        pawn.promote();

        const promoted = PieceFactory.create(promotion, pawn.color, to);
        this.setPieceAt(to, promoted);
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