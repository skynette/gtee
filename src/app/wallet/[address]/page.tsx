// src/app/wallet/[address]/page.tsx
'use client';

import { Key, useState } from 'react';
import { useEffect } from 'react';

import { useParams } from 'next/navigation';

import {
    ActivityIcon,
    AlertCircleIcon,
    ArrowDownIcon,
    ArrowUpIcon,
    BarChart3Icon,
    RefreshCcwIcon,
    WalletIcon,
} from 'lucide-react';
import {
    CartesianGrid,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
    usePerformanceMetrics,
    useRiskAnalysis,
    useSwapMetrics,
    useTokenAnalysis,
    useWalletAnalysis,
} from '@/hooks/useWalletAnalysis';
import { DetailedMetrics } from '@/lib/types/analytics';

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

export default function DashboardPage({}: DashboardProps) {
    const params = useParams();
    const address =
        typeof params?.address === 'string'
            ? decodeURIComponent(params.address)
            : '';

    // Enhanced hooks usage
    const { metrics, loading, error, refresh } = useWalletAnalysis(address);
    const {
        topTokens,
        totalValue,
        tokenDistribution,
        holdingStats,
        performanceByToken,
    } = useTokenAnalysis(metrics);

    const {
        overallRisk,
        warnings,
        concentrationRisk,
        volatilityMetrics,
        defiExposure,
    } = useRiskAnalysis(metrics);

    const {
        totalReturn,
        winRate,
        bestTrade,
        worstTrade,
        tradingFrequency,
        streaks,
        performance,
    } = usePerformanceMetrics(metrics);

    const {
        totalSwaps,
        swapVolume,
        dexDistribution,
        slippageStats,
        timing,
        swapEfficiency,
        volumeAnalysis,
    } = useSwapMetrics(metrics);

    if (!address)
        return (
            <ErrorState
                error={new Error('Invalid wallet address')}
                onRetry={() => (window.location.href = '/')}
            />
        );
    if (loading) return <LoadingState />;
    if (error) return <ErrorState error={error} onRetry={refresh} />;

    return (
        <div className="min-h-screen bg-background p-6">
            {/* Header with Overview */}
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">
                            Wallet Analytics
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            {address}
                        </p>
                        <p className="text-sm text-muted-foreground">
                            Account Age:{' '}
                            {metrics?.overview.accountAge.toFixed(1)} days
                        </p>
                    </div>
                    <Button
                        onClick={refresh}
                        className="flex items-center gap-2">
                        <RefreshCcwIcon className="h-4 w-4" />
                        Refresh
                    </Button>
                </div>
            </div>

            {/* Key Metrics Grid */}
            <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <MetricCard
                    title="Portfolio Value"
                    value={`$${totalValue.toLocaleString()}`}
                    icon={WalletIcon}
                    trend={{
                        value: performance.roi,
                        positive: performance.roi > 0,
                    }}
                    subtitle={`${performanceByToken.length} Tokens`}
                />
                <MetricCard
                    title="Trading Activity"
                    value={`${totalSwaps.toLocaleString()} Swaps`}
                    icon={ActivityIcon}
                    trend={{
                        value: volumeAnalysis.consistency * 100,
                        positive: true,
                    }}
                    subtitle={`$${swapVolume.toLocaleString()} Volume`}
                />
                <MetricCard
                    title="Performance"
                    value={`${(winRate * 100).toFixed(1)}% Win Rate`}
                    icon={BarChart3Icon}
                    trend={{
                        value: performance.riskAdjustedReturn,
                        positive: performance.riskAdjustedReturn > 0,
                    }}
                    subtitle={`${streaks.currentWinStreak} Win Streak`}
                />
                <MetricCard
                    title="Risk Profile"
                    value={`${(overallRisk * 100).toFixed(0)}/100`}
                    icon={AlertCircleIcon}
                    trend={{
                        value: volatilityMetrics.daily,
                        positive: false,
                        neutral: volatilityMetrics.daily < 0.1,
                    }}
                    subtitle={concentrationRisk.description}
                />
            </div>

            {/* Performance and Trading Statistics */}
            <div className="mb-8 grid gap-6 lg:grid-cols-2">
                <Card className="p-6">
                    <h3 className="mb-4 text-lg font-semibold">
                        Performance Over Time
                    </h3>
                    <div className="h-[300px]">
                        <PerformanceChart
                            data={
                                Array.isArray(tradingFrequency)
                                    ? tradingFrequency
                                    : []
                            }
                        />
                    </div>
                    <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
                        <div>
                            <p className="text-muted-foreground">Best Trade</p>
                            <p className="font-medium text-green-500">
                                +${bestTrade.value.toLocaleString()}
                            </p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Worst Trade</p>
                            <p className="font-medium text-red-500">
                                ${worstTrade.value.toLocaleString()}
                            </p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">
                                Average Hold
                            </p>
                            <p className="font-medium">
                                {streaks.averageHoldTime.toFixed(1)}h
                            </p>
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <h3 className="mb-4 text-lg font-semibold">DEX Activity</h3>
                    <div className="space-y-4">
                        {dexDistribution.efficiencyByDex.map((dex, index) => (
                            <DexRow
                                key={dex.dex}
                                rank={index + 1}
                                dex={dex.dex}
                                efficiency={dex.efficiency}
                                volume={swapVolume}
                            />
                        ))}
                    </div>
                    <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
                        <div>
                            <p className="text-muted-foreground">
                                Avg Slippage
                            </p>
                            <p className="font-medium">
                                {slippageStats.average.toFixed(2)}%
                            </p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Best Hours</p>
                            <p className="font-medium">
                                {timing.optimalTradingHours
                                    .map((h) => `${h}:00`)
                                    .join(', ')}
                            </p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">
                                Volume Profile
                            </p>
                            <p className="font-medium capitalize">
                                {volumeAnalysis.volumeProfile}
                            </p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Token Holdings and Risk Analysis */}
            <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2">
                    <Card className="p-6">
                        <h3 className="mb-4 text-lg font-semibold">
                            Token Holdings
                        </h3>
                        <div className="space-y-4">
                            {tokenDistribution.map((token, index) => (
                                <TokenRow
                                    key={token.symbol}
                                    rank={index + 1}
                                    token={{
                                        symbol: token.symbol,
                                        percentage: token.percentage,
                                        value: token.value,
                                        profitLoss:
                                            performanceByToken.find(
                                                (t) =>
                                                    t.symbol === token.symbol,
                                            )?.profitLoss || 0,
                                    }}
                                />
                            ))}
                        </div>
                        <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
                            <div>
                                <p className="text-muted-foreground">
                                    Avg Hold Time
                                </p>
                                <p className="font-medium">
                                    {holdingStats.averageHoldingPeriod.toFixed(
                                        1,
                                    )}
                                    d
                                </p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">
                                    Token Count
                                </p>
                                <p className="font-medium">
                                    {topTokens.length}
                                </p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">
                                    Portfolio Health
                                </p>
                                <p className="font-medium">
                                    {concentrationRisk.tokenLevel < 0.5
                                        ? 'Diverse'
                                        : 'Concentrated'}
                                </p>
                            </div>
                        </div>
                    </Card>
                </div>

                <Card className="p-6">
                    <h3 className="mb-4 text-lg font-semibold">
                        Risk Analysis
                    </h3>
                    <div className="space-y-4">
                        {warnings.map((warning, index) => (
                            <WarningItem key={index} warning={warning} />
                        ))}
                        {defiExposure.highRiskExposure > 0 && (
                            <WarningItem
                                warning={`High risk exposure to DeFi protocols: ${(defiExposure.highRiskExposure * 100).toFixed(1)}%`}
                            />
                        )}
                    </div>
                    <div className="mt-4 space-y-2">
                        <p className="text-sm text-muted-foreground">
                            Top Protocols:{' '}
                            {defiExposure.topProtocols.join(', ')}
                        </p>
                        <p className="text-sm text-muted-foreground">
                            Daily Value at Risk:{' '}
                            {volatilityMetrics.daily.toFixed(2)}%
                        </p>
                        <p className="text-sm text-muted-foreground">
                            Risk-Adjusted Return:{' '}
                            {volatilityMetrics.riskAdjustedReturn.toFixed(2)}
                        </p>
                    </div>
                </Card>
            </div>

            {/* Activity and Risk Analysis */}
            <div className="grid gap-6 lg:grid-cols-3">
                {/* Token Holdings and Activity Section */}
                <div className="lg:col-span-2">
                    {/* Token Holdings Card */}
                    <Card className="mb-6 p-6">
                        <h3 className="mb-4 text-lg font-semibold">
                            Token Holdings
                        </h3>
                        <div className="space-y-4">
                            {tokenDistribution.map((token, index) => (
                                <TokenRow
                                    key={token.symbol}
                                    rank={index + 1}
                                    token={{
                                        symbol: token.symbol,
                                        percentage: token.percentage,
                                        value: token.value,
                                        profitLoss:
                                            performanceByToken.find(
                                                (t) =>
                                                    t.symbol === token.symbol,
                                            )?.profitLoss || 0,
                                    }}
                                />
                            ))}
                        </div>
                        <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
                            <div>
                                <p className="text-muted-foreground">
                                    Avg Hold Time
                                </p>
                                <p className="font-medium">
                                    {holdingStats.averageHoldingPeriod.toFixed(
                                        1,
                                    )}
                                    d
                                </p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">
                                    Token Count
                                </p>
                                <p className="font-medium">
                                    {topTokens.length}
                                </p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">
                                    Portfolio Health
                                </p>
                                <p className="font-medium">
                                    {concentrationRisk.tokenLevel < 0.5
                                        ? 'Diverse'
                                        : 'Concentrated'}
                                </p>
                            </div>
                        </div>
                    </Card>

                    {/* Recent Activity Card */}
                    <Card className="p-6">
                        <h3 className="mb-4 text-lg font-semibold">
                            Recent Activity
                        </h3>
                        <ActivityList metrics={metrics} />
                    </Card>
                </div>

                {/* Risk Analysis Section */}
                <Card className="p-6">
                    <h3 className="mb-4 text-lg font-semibold">
                        Risk Analysis
                    </h3>
                    <div className="space-y-4">
                        {warnings.map((warning, index) => (
                            <WarningItem key={index} warning={warning} />
                        ))}
                        {defiExposure.highRiskExposure > 0 && (
                            <WarningItem
                                warning={`High risk exposure to DeFi protocols: ${(
                                    defiExposure.highRiskExposure * 100
                                ).toFixed(1)}%`}
                            />
                        )}
                    </div>
                    <div className="mt-4 space-y-2">
                        <p className="text-sm text-muted-foreground">
                            Top Protocols:{' '}
                            {defiExposure.topProtocols.join(', ')}
                        </p>
                        <p className="text-sm text-muted-foreground">
                            Daily Value at Risk:{' '}
                            {volatilityMetrics.daily.toFixed(2)}%
                        </p>
                        <p className="text-sm text-muted-foreground">
                            Risk-Adjusted Return:{' '}
                            {volatilityMetrics.riskAdjustedReturn.toFixed(2)}
                        </p>
                    </div>
                </Card>
            </div>
        </div>
    );
}

function DexRow({
    rank,
    dex,
    efficiency,
    volume,
}: {
    rank: number;
    dex: string;
    efficiency: number;
    volume: number;
}) {
    return (
        <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-muted-foreground">
                    #{rank}
                </span>
                <div>
                    <p className="font-medium">{dex}</p>
                    <p className="text-sm text-muted-foreground">
                        ${(volume * efficiency).toLocaleString()}
                    </p>
                </div>
            </div>
            <div className="text-sm">
                <div className="h-2 w-24 rounded-full bg-secondary">
                    <div
                        className="h-2 rounded-full bg-primary"
                        style={{ width: `${efficiency * 100}%` }}
                    />
                </div>
                <span className="mt-1 block text-right text-xs text-muted-foreground">
                    {(efficiency * 100).toFixed(1)}% Efficient
                </span>
            </div>
        </div>
    );
}

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
                className={`text-sm ${
                    token.profitLoss >= 0 ? 'text-green-500' : 'text-red-500'
                }`}>
                {token.profitLoss >= 0 ? '+' : ''}
                {token.profitLoss.toFixed(2)}%
            </div>
        </div>
    );
}

function MetricCard({
    title,
    value,
    icon: Icon,
    trend,
    subtitle,
}: {
    title: string;
    value: string;
    icon: any;
    trend: {
        value: number;
        positive?: boolean;
        neutral?: boolean;
    };
    subtitle: string;
}) {
    return (
        <Card className="p-6">
            <div className="flex items-center justify-between">
                <Icon className="h-5 w-5 text-muted-foreground" />
                {trend && !trend.neutral && (
                    <div
                        className={`flex items-center text-sm ${
                            trend.positive ? 'text-green-500' : 'text-red-500'
                        }`}>
                        {trend.positive ? (
                            <ArrowUpIcon className="h-4 w-4" />
                        ) : (
                            <ArrowDownIcon className="h-4 w-4" />
                        )}
                        <span>{Math.abs(trend.value).toFixed(1)}%</span>
                    </div>
                )}
            </div>
            <h3 className="mt-4 text-sm font-medium text-muted-foreground">
                {title}
            </h3>
            <p className="mt-2 text-2xl font-bold">{value}</p>
            <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        </Card>
    );
}

function PerformanceChart({ data }: { data: any[] }) {
    if (!data?.length) {
        return (
            <div className="flex h-full items-center justify-center">
                <p className="text-sm text-muted-foreground">
                    No data available
                </p>
            </div>
        );
    }

    // Process data to show cumulative performance
    const processedData = data.map((point, index) => ({
        ...point,
        date: new Date(point.date).toLocaleDateString(),
        cumulativeProfitLoss: data
            .slice(0, index + 1)
            .reduce((sum, p) => sum + p.profitLoss, 0),
    }));

    return (
        <ResponsiveContainer width="100%" height="100%">
            <LineChart data={processedData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-50" />
                <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => value.split(',')[0]}
                />
                <YAxis
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => `${value.toFixed(2)}%`}
                />
                <Tooltip
                    formatter={(value: number) => `${value.toFixed(2)}%`}
                    labelFormatter={(label) =>
                        new Date(label).toLocaleDateString()
                    }
                />
                <Line
                    type="monotone"
                    dataKey="cumulativeProfitLoss"
                    stroke="#8884d8"
                    strokeWidth={2}
                    dot={false}
                />
            </LineChart>
        </ResponsiveContainer>
    );
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

function WarningItem({ warning }: { warning: string }) {
    return (
        <div className="flex items-center gap-3 rounded-lg border border-destructive/20 bg-destructive/10 p-4">
            <AlertCircleIcon className="h-4 w-4 text-destructive" />
            <div>
                <p className="text-sm font-medium text-destructive">
                    {warning}
                </p>
            </div>
        </div>
    );
}
// Loading State Component
function LoadingState() {
    return (
        <div className="p-6">
            <Skeleton className="mb-8 h-8 w-64" />
            <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-32" />
                ))}
            </div>
            <div className="grid gap-6 lg:grid-cols-2">
                <Skeleton className="h-[400px]" />
                <Skeleton className="h-[400px]" />
            </div>
        </div>
    );
}

// Error State Component
function ErrorState({ error, onRetry }: { error: Error; onRetry: () => void }) {
    return (
        <div className="flex min-h-screen items-center justify-center p-6">
            <Card className="max-w-md p-6 text-center">
                <AlertCircleIcon className="mx-auto mb-4 h-12 w-12 text-destructive" />
                <h2 className="mb-2 text-lg font-semibold">
                    Error Loading Data
                </h2>
                <p className="mb-4 text-sm text-muted-foreground">
                    {error.message}
                </p>
                <Button onClick={onRetry}>Try Again</Button>
            </Card>
        </div>
    );
}

function isSwapActivity(activity: Activity): activity is SwapActivity {
    return activity.type === 'Swap';
}

function isTokenActivity(activity: Activity): activity is TokenActivity {
    return activity.type === 'Token';
}
