export interface StockfishApiResponse {
    success: boolean;
    evaluation: number | null;
    mate: number | null;
    bestmove: string;
    continuation: string;
}