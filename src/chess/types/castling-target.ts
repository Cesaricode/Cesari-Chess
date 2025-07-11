import { Position } from "./position.js";

export type CastlingTarget = {
    to: Position;
    rook: Position;
    right: boolean;
    side: "kingside" | "queenside";
};