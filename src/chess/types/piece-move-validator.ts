import { Game } from "../game/game";
import { Move } from "./move";

export type PieceMoveValidator = (game: Game, move: Move) => boolean;