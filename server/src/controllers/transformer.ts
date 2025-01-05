import { ChartData, ExecutionResults, PortfolioMetrics, SummaryMetrics, TokenData, Trade, TransformedData } from "../types/types";

export function transformDuneData(data: ExecutionResults): TransformedData {
    const trades: Trade[] = [];
    const closedTrades: Trade[] = [];
    let totalPnL = 0;
    let activePositions = 0;

    // Process each token data into trades
    data.result.rows.forEach((token: TokenData) => {
        // Extract token name from HTML link
        const tokenName = token.token_address.match(/>([^<]+)</)?.[1] || 'Unknown';
        
        const trade: Trade = {
            token: tokenName,
            entry: {
                price: token.initial_buy_price || 0,
                amount: token.token_balance || 0,
                timestamp: token.latest_block_time || new Date().toISOString(),
                total_cost: token.buy || 0,
            },
            exit: {
                price: token.sell ? token.latest_price : null,
                amount: token.sell || null,
                timestamp: token.sell ? token.latest_block_time : null,
                total_return: token.sell || null,
            },
            metrics: {
                pnl: token.total_pnl,
                roi: token.total_pnl ? (token.total_pnl / token.buy! * 100) : null,
                holding_time_hours: token.latest_block_time ? 
                    calculateHoldingHours(new Date(token.latest_block_time)) : null,
                max_drawdown: calculateMaxDrawdown(token),
            },
            status: token.sell ? 'CLOSED' : 'OPEN',
        };

        if (trade.status === 'CLOSED') {
            closedTrades.push(trade);
        } else {
            activePositions++;
        }

        if (token.total_pnl) {
            totalPnL += token.total_pnl;
        }

        trades.push(trade);
    });

    // Calculate portfolio metrics
    const portfolio_metrics = calculatePortfolioMetrics(trades);

    // Calculate summary metrics
    const summary_metrics = calculateSummaryMetrics(trades, totalPnL, activePositions);

    // Generate chart data
    const chart_data = generateChartData(trades);

    return {
        trades,
        portfolio_metrics,
        summary_metrics,
        chart_data,
    };
}

function calculateHoldingHours(timestamp: Date): number {
    return Math.floor((new Date().getTime() - timestamp.getTime()) / (1000 * 60 * 60));
}

function calculateMaxDrawdown(token: TokenData): number | null {
    if (!token.initial_buy_price || !token.latest_price) return null;
    return ((token.latest_price - token.initial_buy_price) / token.initial_buy_price) * 100;
}

function calculatePortfolioMetrics(trades: Trade[]): PortfolioMetrics {
    const closedTrades = trades.filter(t => t.status === 'CLOSED');
    const winningTrades = closedTrades.filter(t => t.metrics.pnl && t.metrics.pnl > 0);

    return {
        total_trades: trades.length,
        win_rate: closedTrades.length ? (winningTrades.length / closedTrades.length) * 100 : 0,
        average_roi: closedTrades.length ? 
            closedTrades.reduce((acc, t) => acc + (t.metrics.roi || 0), 0) / closedTrades.length : 0,
        sharpe_ratio: calculateSharpeRatio(trades),
        max_drawdown: calculatePortfolioMaxDrawdown(trades),
    };
}

function calculateSummaryMetrics(trades: Trade[], totalPnL: number, activePositions: number): SummaryMetrics {
    const closedTrades = trades.filter(t => t.status === 'CLOSED');
    const winningTrades = closedTrades.filter(t => t.metrics.pnl && t.metrics.pnl > 0);
    
    const sortedByPnL = [...trades].sort((a, b) => 
        (b.metrics.pnl || 0) - (a.metrics.pnl || 0));

    return {
        totalTrades: trades.length,
        winRate: closedTrades.length ? (winningTrades.length / closedTrades.length) * 100 : 0,
        totalPnL,
        activePositions,
        avgHoldingTime: calculateAverageHoldingTime(trades),
        biggestWin: {
            token: sortedByPnL[0]?.token || '',
            amount: sortedByPnL[0]?.metrics.pnl || 0,
        },
        biggestLoss: {
            token: sortedByPnL[sortedByPnL.length - 1]?.token || '',
            amount: sortedByPnL[sortedByPnL.length - 1]?.metrics.pnl || 0,
        },
    };
}

function generateChartData(trades: Trade[]): ChartData {
    return {
        pnlDistribution: trades.map(t => ({
            token: t.token,
            pnl: t.metrics.pnl || 0,
            color: t.metrics.pnl && t.metrics.pnl > 0 ? '#4CAF50' : '#F44336',
        })),
        positionSizeVsReturns: trades.map(t => ({
            size: t.entry.total_cost,
            return: t.metrics.roi || 0,
        })),
        timeAnalysis: generateTimeAnalysis(trades),
        riskMetrics: [
            { metric: 'Sharpe Ratio', value: calculateSharpeRatio(trades) },
            { metric: 'Max Drawdown', value: calculatePortfolioMaxDrawdown(trades) },
            { metric: 'Win Rate', value: calculateWinRate(trades) },
        ],
    };
}

// Helper functions
function calculateSharpeRatio(trades: Trade[]): number {
    const returns = trades.map(t => t.metrics.roi || 0);
    const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
    const stdDev = Math.sqrt(
        returns.reduce((a, b) => a + Math.pow(b - avgReturn, 2), 0) / returns.length
    );
    return stdDev === 0 ? 0 : avgReturn / stdDev;
}

function calculatePortfolioMaxDrawdown(trades: Trade[]): number {
    return Math.min(...trades.map(t => t.metrics.max_drawdown || 0));
}

function calculateAverageHoldingTime(trades: Trade[]): number {
    const holdingTimes = trades.map(t => t.metrics.holding_time_hours || 0);
    return holdingTimes.reduce((a, b) => a + b, 0) / holdingTimes.length;
}

function generateTimeAnalysis(trades: Trade[]): Array<{ timeFrame: string; winRate: number }> {
    // Sample time frames: last 24h, last week, last month
    const timeFrames = [24, 168, 720]; // hours
    return timeFrames.map(hours => ({
        timeFrame: `${hours}h`,
        winRate: calculateWinRateForTimeFrame(trades, hours),
    }));
}

function calculateWinRateForTimeFrame(trades: Trade[], hours: number): number {
    const relevantTrades = trades.filter(t => 
        t.metrics.holding_time_hours && t.metrics.holding_time_hours <= hours
    );
    const winningTrades = relevantTrades.filter(t => t.metrics.pnl && t.metrics.pnl > 0);
    return relevantTrades.length ? (winningTrades.length / relevantTrades.length) * 100 : 0;
}

function calculateWinRate(trades: Trade[]): number {
    const closedTrades = trades.filter(t => t.status === 'CLOSED');
    const winningTrades = closedTrades.filter(t => t.metrics.pnl && t.metrics.pnl > 0);
    return closedTrades.length ? (winningTrades.length / closedTrades.length) * 100 : 0;
}