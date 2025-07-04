export enum GameStatus {
    Ongoing = 'ongoing',
    Draw = 'draw',
    Stalemate = 'stalemate',
    Checkmate = 'checkmate',
    Resignation = 'resignation',
    Timeout = 'timeout',
    Abandoned = 'abandoned',
    InsufficientMaterial = 'insufficient_material',
    ThreefoldRepetition = 'threefold_repetition',
    FiftyMoveRule = 'fifty_move_rule',
}