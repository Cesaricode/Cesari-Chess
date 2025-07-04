export enum GameStatus {
    Ongoing = 'ongoing',
    Draw = 'draw',
    Stalemate = 'stalemate',
    WhiteWins = 'white_wins',
    BlackWins = 'black_wins',
    Resignation = 'resignation',
    Timeout = 'timeout',
    Abandoned = 'abandoned',
    InsufficientMaterial = 'insufficient_material',
    ThreefoldRepetition = 'threefold_repetition',
    FiftyMoveRule = 'fifty_move_rule',
}