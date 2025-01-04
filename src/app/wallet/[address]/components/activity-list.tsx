import { Badge } from "@/components/ui/badge";
import { DetailedMetrics } from "@/lib/types/analytics";


interface SwapActivity {
    type: 'Swap';
    description: string;
    timestamp: number;
    amount: number;
    slippage: number;
    icon: string;
    efficiency: 'Efficient' | 'High Slippage';
}

interface TokenActivity {
    type: 'Token';
    description: string;
    timestamp: number;
    amount: number;
    profitLoss: number;
    icon: string;
    performance: 'Profit' | 'Loss';
}

type Activity = SwapActivity | TokenActivity;

interface DashboardProps {
    params: {
        address: string;
    };
}


function ActivityList({ metrics }: { metrics: DetailedMetrics | null }) {
    if (!metrics) {
        return (
            <p className="text-sm text-muted-foreground">No recent activity</p>
        );
    }

    // Enhanced activity tracking
    const activities: Activity[] = [
        // Swap activities with more detail
        ...metrics.swapMetrics.dexDistribution.map(
            (swap): SwapActivity => ({
                type: 'Swap',
                description: `${swap.dex} Trade`,
                timestamp: Date.now(),
                amount: swap.volume,
                slippage: swap.avgSlippage,
                icon: '🔄',
                efficiency:
                    swap.avgSlippage < 1 ? 'Efficient' : 'High Slippage',
            }),
        ),
        // Token activities with performance
        ...metrics.tokenMetrics.map(
            (token): TokenActivity => ({
                type: 'Token',
                description: `${token.symbol} Activity`,
                timestamp: token.lastActivity,
                amount: token.volume24h,
                profitLoss: token.profitLoss,
                icon: '💰',
                performance: token.profitLoss >= 0 ? 'Profit' : 'Loss',
            }),
        ),
    ]
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 5);

    if (activities.length === 0) {
        return (
            <p className="text-sm text-muted-foreground">No recent activity</p>
        );
    }

    return (
        <div className="space-y-4">
            {activities.map((activity, index) => (
                <div
                    key={`${activity.type}-${index}`}
                    className="flex items-center justify-between rounded-lg border p-4">
                    <div className="flex items-center gap-3">
                        <span className="text-xl">{activity.icon}</span>
                        <div>
                            <div className="flex items-center gap-2">
                                <p className="font-medium">{activity.type}</p>
                                <Badge
                                    variant={
                                        isSwapActivity(activity)
                                            ? activity.efficiency ===
                                                'Efficient'
                                                ? 'secondary'
                                                : 'destructive'
                                            : activity.performance === 'Profit'
                                                ? 'secondary'
                                                : 'destructive'
                                    }>
                                    {isSwapActivity(activity)
                                        ? activity.efficiency
                                        : activity.performance}
                                </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                {activity.description} •{' '}
                                {new Date(activity.timestamp).toLocaleString()}
                            </p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="font-medium">
                            {activity.amount.toFixed(4)} SOL
                        </p>
                        {isSwapActivity(activity) && (
                            <p className="text-xs text-muted-foreground">
                                Slippage: {activity.slippage.toFixed(2)}%
                            </p>
                        )}
                        {isTokenActivity(activity) && (
                            <p
                                className={`text-xs ${activity.profitLoss >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                {activity.profitLoss >= 0 ? '+' : ''}
                                {activity.profitLoss.toFixed(2)}%
                            </p>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}


function isSwapActivity(activity: Activity): activity is SwapActivity {
    return activity.type === 'Swap';
}

function isTokenActivity(activity: Activity): activity is TokenActivity {
    return activity.type === 'Token';
}
