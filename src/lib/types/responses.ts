export interface AnalyzeTradesResponse {
    success: boolean;
    data: {
        execution_id: string;
        state: "QUERY_STATE_PENDING";
    };
}

export interface TaskStatusResponse {
    success: boolean;
    data: {
        execution_id: string;
        query_id: number;
        is_execution_finished: boolean;
        state: "QUERY_STATE_EXECUTING" | "QUERY_STATE_COMPLETED";
        submitted_at: string;
        execution_started_at: string;
        execution_ended_at?: string;
        expires_at?: string;
        result?: {
            rows: Array<{
                buy: number;
                initial_buy_price: number;
                latest_block_time: string;
                latest_price: number;
                pnl: number | null;
                sell: number | null;
                token_address: string;
                token_balance: number;
                total_pnl: number;
                usd_balance: number;
            }>;
            metadata: {
                column_names: string[];
                column_types: string[];
                row_count: number;
                result_set_bytes: number;
                total_row_count: number;
                total_result_set_bytes: number;
                datapoint_count: number;
                pending_time_millis: number;
                execution_time_millis: number;
            };
        };
    };
}
