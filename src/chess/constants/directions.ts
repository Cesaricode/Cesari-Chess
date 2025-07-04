export const BISHOP_DIRECTIONS = [
    { x: 1, y: 1 },
    { x: 1, y: -1 },
    { x: -1, y: 1 },
    { x: -1, y: -1 }
] as const;

export const ROOK_DIRECTIONS = [
    { x: 1, y: 0 },
    { x: -1, y: 0 },
    { x: 0, y: 1 },
    { x: 0, y: -1 }
] as const;

export const QUEEN_DIRECTIONS = [
    ...BISHOP_DIRECTIONS,
    ...ROOK_DIRECTIONS
] as const;

export const KNIGHT_DIRECTIONS = [
    { x: 1, y: 2 }, { x: 2, y: 1 }, { x: 2, y: -1 }, { x: 1, y: -2 },
    { x: -1, y: -2 }, { x: -2, y: -1 }, { x: -2, y: 1 }, { x: -1, y: 2 }
] as const;

export const PAWN_MOVE_DIRECTIONS = {
    white: [{ x: 0, y: 1 }],
    black: [{ x: 0, y: -1 }]
} as const;

export const PAWN_CAPTURE_DIRECTIONS = {
    white: [{ x: -1, y: 1 }, { x: 1, y: 1 }],
    black: [{ x: -1, y: -1 }, { x: 1, y: -1 }]
} as const;

export const KING_DIRECTIONS = QUEEN_DIRECTIONS;