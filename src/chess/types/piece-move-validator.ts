import { Game } from "../game/game.js";
import { Move } from "./move.js";

export type PieceMoveValidator = (game: Game, move: Move) => boolean;