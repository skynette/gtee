function TokenRow({
    rank,
    token,
}: {
    rank: number;
    token: {
        symbol: string;
        percentage: number;
        value: number;
        profitLoss: number;
    };
}) {
    return (
        <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-muted-foreground">
                    #{rank}
                </span>
                <div>
                    <p className="font-medium">{token.symbol}</p>
                    <div className="flex items-center gap-2">
                        <p className="text-sm text-muted-foreground">
                            ${token.value.toLocaleString()}
                        </p>
                        <span className="text-xs text-muted-foreground">
                            ({token.percentage.toFixed(1)}%)
                        </span>
                    </div>
                </div>
            </div>
            <div
                className={`text-sm ${token.profitLoss >= 0 ? 'text-green-500' : 'text-red-500'
                    }`}>
                {token.profitLoss >= 0 ? '+' : ''}
                {token.profitLoss.toFixed(2)}%
            </div>
        </div>
    );
}


export default TokenRow