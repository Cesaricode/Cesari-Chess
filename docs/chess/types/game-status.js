export var GameStatus;
(function (GameStatus) {
    GameStatus["Ongoing"] = "ongoing";
    GameStatus["Draw"] = "draw";
    GameStatus["Stalemate"] = "stalemate";
    GameStatus["WhiteWins"] = "white_wins";
    GameStatus["BlackWins"] = "black_wins";
    GameStatus["Resignation"] = "resignation";
    GameStatus["Timeout"] = "timeout";
    GameStatus["Abandoned"] = "abandoned";
    GameStatus["InsufficientMaterial"] = "insufficient_material";
    GameStatus["ThreefoldRepetition"] = "threefold_repetition";
    GameStatus["FiftyMoveRule"] = "fifty_move_rule";
})(GameStatus || (GameStatus = {}));
