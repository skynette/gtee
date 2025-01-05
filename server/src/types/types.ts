// Types for API responses
export interface ExecutionResponse {
    execution_id: string;
    state: string;
}

export interface ExecutionStatus {
    execution_id: string;
    query_id: number;
    is_execution_finished: boolean;
    state: string;
    submitted_at: string;
    expires_at: string;
    execution_started_at: string;
    execution_ended_at: string;
    result_metadata: {
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
}

export interface TokenData {
    token_address: string;
    buy: number | null;
    sell: number | null;
    pnl: number | null;
    usd_balance: number | null;
    total_pnl: number | null;
    token_balance: number | null;
    initial_buy_price: number | null;
    latest_price: number | null;
    latest_block_time: string | null;
}

export interface ExecutionResults {
    execution_id: string;
    query_id: number;
    state: string;
    result: {
        rows: TokenData[];
        metadata: ExecutionStatus['result_metadata'];
    };
}


export interface Trade {
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
        pnl: number | null;
        roi: number | null;
        holding_time_hours: number | null;
        max_drawdown: number | null;
    };
    status: 'OPEN' | 'CLOSED';
}

export interface PortfolioMetrics {
    total_trades: number;
    win_rate: number;
    average_roi: number;
    sharpe_ratio: number;
    max_drawdown: number;
}

export interface SummaryMetrics {
    totalTrades: number;
    winRate: number;
    totalPnL: number;
    activePositions: number;
    avgHoldingTime: number;
    biggestWin: { token: string; amount: number };
    biggestLoss: { token: string; amount: number };
}

export interface ChartData {
    pnlDistribution: Array<{ token: string; pnl: number; color: string }>;
    positionSizeVsReturns: Array<{ size: number; return: number }>;
    timeAnalysis: Array<{ timeFrame: string; winRate: number }>;
    riskMetrics: Array<{ metric: string; value: number }>;
}

export interface TransformedData {
    trades: Trade[];
    portfolio_metrics: PortfolioMetrics;
    summary_metrics: SummaryMetrics;
    chart_data: ChartData;
}


export interface TradingMistake {
    title: string;
    description: string;
    severity: 'high' | 'medium' | 'low';
}

export interface TradingImprovement {
    category: string;
    recommendations: string[];
}

export interface TradingPatterns {
    winning: string[];
    losing: string[];
    general: string[];
}

export interface AnalysisResponse {
    mistakes: TradingMistake[];
    improvements: TradingImprovement[];
    patterns: TradingPatterns;
}
