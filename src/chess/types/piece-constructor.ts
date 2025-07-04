import { Piece } from "../pieces/piece.js";
import { Color } from "./color.js";
import { Position } from "./position.js";

export type PieceConstructor = new (color: Color, position: Position) => Piece;