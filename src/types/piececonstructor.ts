import { Piece } from "../pieces/piece";
import { Color } from "./color";
import { Position } from "./position";

export type PieceConstructor = new (color: Color, position: Position) => Piece;