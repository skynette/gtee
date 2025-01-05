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
    transformedData?: {
        trades: Array<{
            token: string;
            entry: {
                price: number;
                amount: number;
                timestamp: string;
                total_cost: number;
            };
            exit: {
                price: number | null;
                amount: number | null;
                timestamp: string | null;
                total_return: number | null;
            };
            metrics: {
                pnl: number;
                roi: number;
                holding_time_hours: number;
                max_drawdown: number;
            };
            status: "OPEN" | "CLOSED";
        }>;
        portfolio_metrics: {
            total_trades: number;
            win_rate: number;
            average_roi: number;
            sharpe_ratio: number;
            max_drawdown: number;
        };
        summary_metrics: {
            totalTrades: number;
            winRate: number;
            totalPnL: number;
            activePositions: number;
            avgHoldingTime: number;
            biggestWin: {
                token: string;
                amount: number;
            };
            biggestLoss: {
                token: string;
                amount: number;
            };
        };
        chart_data: {
            pnlDistribution: Array<{
                token: string;
                pnl: number;
                color: string;
            }>;
            positionSizeVsReturns: Array<{
                size: number;
                return: number;
            }>;
            timeAnalysis: Array<{
                timeFrame: string;
                winRate: number;
            }>;
            riskMetrics: Array<{
                metric: string;
                value: number;
            }>;
        };
    };
    analysis?: {
        mistakes: Array<{
            title: string;
            description: string;
            severity: "high" | "medium" | "low";
        }>;
        improvements: Array<{
            category: string;
            recommendations: string[];
        }>;
        patterns: {
            winning: string[];
            losing: string[];
            general: string[];
        };
    };
}
