import { TaskStatusResponse } from '@/lib/types/responses';

// Define all required interfaces
interface SummaryMetrics {
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
}

interface PortfolioMetrics {
    total_trades: number;
    win_rate: number;
    average_roi: number;
    sharpe_ratio: number;
    max_drawdown: number;
}

interface ChartData {
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
}

interface Analysis {
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
}

interface Trade {
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
}

interface FormattedData {
    trades: Trade[];
    portfolio_metrics: PortfolioMetrics;
    summary_metrics: SummaryMetrics;
    chart_data: ChartData;
    analysis: Analysis;
}


export const getDefaultMetrics = (): SummaryMetrics => ({
    totalTrades: 0,
    winRate: 0,
    totalPnL: 0,
    activePositions: 0,
    avgHoldingTime: 0,
    biggestWin: { token: '', amount: 0 },
    biggestLoss: { token: '', amount: 0 }
});

export const getDefaultPortfolioMetrics = (): PortfolioMetrics => ({
    total_trades: 0,
    win_rate: 0,
    average_roi: 0,
    sharpe_ratio: 0,
    max_drawdown: 0
});

export const getDefaultChartData = (): ChartData => ({
    pnlDistribution: [],
    positionSizeVsReturns: [],
    timeAnalysis: [],
    riskMetrics: []
});

export const getDefaultAnalysis = (): Analysis => ({
    mistakes: [],
    improvements: [],
    patterns: {
        winning: [],
        losing: [],
        general: []
    }
});


export const formatTradingData = (data: TaskStatusResponse | undefined): FormattedData => {
    if (!data?.transformedData) {
        return {
            trades: [],
            portfolio_metrics: getDefaultPortfolioMetrics(),
            summary_metrics: getDefaultMetrics(),
            chart_data: getDefaultChartData(),
            analysis: getDefaultAnalysis()
        };
    }

    return {
        trades: data.transformedData.trades || [],
        portfolio_metrics: data.transformedData.portfolio_metrics || getDefaultPortfolioMetrics(),
        summary_metrics: data.transformedData.summary_metrics || getDefaultMetrics(),
        chart_data: data.transformedData.chart_data || getDefaultChartData(),
        analysis: data.analysis || getDefaultAnalysis()
    };
};


// Export types for use in components
export type {
    SummaryMetrics,
    PortfolioMetrics,
    ChartData,
    Analysis,
    Trade,
    FormattedData
};