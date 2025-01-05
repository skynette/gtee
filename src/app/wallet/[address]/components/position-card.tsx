interface PositionCardProps {
    rank: number;
    trade: {
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
    };
    totalPortfolioValue: number;
}

function PositionCard({ rank, trade, totalPortfolioValue }: PositionCardProps) {
    const {
        token,
        entry,
        exit,
        metrics,
        status
    } = trade;

    const portfolioPercentage = (entry.total_cost / totalPortfolioValue) * 100;
    const formattedHoldingTime = metrics.holding_time_hours > 24
        ? `${(metrics.holding_time_hours / 24).toFixed(1)}d`
        : `${Math.round(metrics.holding_time_hours)}h`;

    return (
        <div className="flex flex-col gap-3 rounded-lg border p-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-muted-foreground">
                        #{rank}
                    </span>
                    <div>
                        <div className="flex items-center gap-2">
                            <p className="font-medium">{token}</p>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${status === 'OPEN'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-gray-100 text-gray-800'
                                }`}>
                                {status}
                            </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            ${entry.total_cost.toLocaleString()} ({portfolioPercentage.toFixed(1)}%)
                        </p>
                    </div>
                </div>
                <div className={`text-sm ${metrics.pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {metrics.pnl >= 0 ? '+' : ''}{metrics.pnl.toFixed(2)}%
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                    <p className="text-muted-foreground">Entry Price</p>
                    <p className="font-medium">${entry.price.toFixed(8)}</p>
                </div>
                <div>
                    <p className="text-muted-foreground">
                        {status === 'OPEN' ? 'Current Price' : 'Exit Price'}
                    </p>
                    <p className="font-medium">
                        ${exit.price?.toFixed(8) || 'N/A'}
                    </p>
                </div>
                <div>
                    <p className="text-muted-foreground">Holding Time</p>
                    <p className="font-medium">{formattedHoldingTime}</p>
                </div>
                <div>
                    <p className="text-muted-foreground">Max Drawdown</p>
                    <p className="font-medium text-red-500">
                        {metrics.max_drawdown.toFixed(2)}%
                    </p>
                </div>
            </div>
        </div>
    );
}

export default PositionCard;