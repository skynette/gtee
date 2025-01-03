// src/app/wallet/[address]/page.tsx
'use client';

import { Key, useState } from 'react';

import { motion } from 'framer-motion';
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

interface DashboardProps {
    params: {
        address: string;
    };
}

export default function DashboardPage({ params }: DashboardProps) {
    const decodedAddress = decodeURIComponent(params.address);
    const { metrics, loading, error, refresh } = useWalletAnalysis(
        params.address,
    );
    const { topTokens, totalValue } = useTokenAnalysis(metrics);
    const { overallRisk, warnings } = useRiskAnalysis(metrics);
    const { totalReturn, winRate } = usePerformanceMetrics(metrics);
    const { totalSwaps, swapVolume } = useSwapMetrics(metrics);

    if (loading) return <LoadingState />;
    if (error) return <ErrorState error={error} onRetry={refresh} />;

    return (
        <div className="min-h-screen bg-background p-6">
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">
                        Wallet Analytics
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        {params.address}
                    </p>
                </div>
                <Button onClick={refresh} className="flex items-center gap-2">
                    <RefreshCcwIcon className="h-4 w-4" />
                    Refresh
                </Button>
            </div>

            {/* Key Metrics */}
            <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <MetricCard
                    title="Total Value"
                    value={`$${totalValue.toLocaleString()}`}
                    icon={WalletIcon}
                    trend={{
                        value: 12.5,
                        positive: true,
                    }}
                />
                <MetricCard
                    title="Total Swaps"
                    value={totalSwaps.toString()}
                    icon={ActivityIcon}
                    trend={{
                        value: 5.2,
                        positive: true,
                    }}
                />
                <MetricCard
                    title="Win Rate"
                    value={`${(winRate * 100).toFixed(1)}%`}
                    icon={BarChart3Icon}
                    trend={{
                        value: -2.3,
                        positive: false,
                    }}
                />
                <MetricCard
                    title="Risk Score"
                    value={`${(overallRisk * 100).toFixed(0)}/100`}
                    icon={AlertCircleIcon}
                    trend={{
                        value: 0,
                        neutral: true,
                    }}
                />
            </div>

            {/* Charts and Details */}
            <div className="mb-8 grid gap-6 lg:grid-cols-2">
                <Card className="p-6">
                    <h3 className="mb-4 text-lg font-semibold">
                        Performance Over Time
                    </h3>
                    <div className="h-[300px]">
                        <PerformanceChart
                            data={metrics?.tradingStats?.tradingFrequency || []}
                        />
                    </div>
                </Card>

                <Card className="p-6">
                    <h3 className="mb-4 text-lg font-semibold">Top Tokens</h3>
                    <div className="space-y-4">
                        {topTokens.map(
                            (
                                token: {
                                    symbol: string;
                                    volume24h: number;
                                    profitLoss: number;
                                },
                                index: number,
                            ) => (
                                <TokenRow
                                    key={token.symbol}
                                    rank={index + 1}
                                    token={{
                                        symbol: token.symbol,
                                        volume: token.volume24h,
                                        profitLoss: token.profitLoss,
                                    }}
                                />
                            ),
                        )}
                    </div>
                </Card>
            </div>

            {/* Activity and Risk Analysis */}
            <div className="grid gap-6 lg:grid-cols-3">
                <Card className="col-span-2 p-6">
                    <h3 className="mb-4 text-lg font-semibold">
                        Recent Activity
                    </h3>
                    <ActivityList metrics={metrics} />
                </Card>

                <Card className="p-6">
                    <h3 className="mb-4 text-lg font-semibold">
                        Risk Warnings
                    </h3>
                    <div className="space-y-4">
                        {warnings.map(
                            (
                                warning: string,
                                index: Key | null | undefined,
                            ) => (
                                <WarningItem key={index} warning={warning} />
                            ),
                        )}
                    </div>
                </Card>
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

// Helper Components
function MetricCard({
    title,
    value,
    icon: Icon,
    trend,
}: {
    title: string;
    value: string;
    icon: any;
    trend: {
        value: number;
        positive?: boolean;
        neutral?: boolean;
    };
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
                        <span>{Math.abs(trend.value)}%</span>
                    </div>
                )}
            </div>
            <h3 className="mt-4 text-sm font-medium text-muted-foreground">
                {title}
            </h3>
            <p className="mt-2 text-2xl font-bold">{value}</p>
        </Card>
    );
}

function TokenRow({ rank, token }: { rank: number; token: any }) {
    return (
        <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-muted-foreground">
                    #{rank}
                </span>
                <div>
                    <p className="font-medium">{token.symbol}</p>
                    <p className="text-sm text-muted-foreground">
                        ${token.volume.toLocaleString()}
                    </p>
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

    return (
        <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line
                    type="monotone"
                    dataKey="profitLoss"
                    stroke="#8884d8"
                    strokeWidth={2}
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

    // Combine different types of activities
    const activities = [
        // Add swap activities
        ...metrics.swapMetrics.dexDistribution.map((swap) => ({
            type: 'Swap',
            description: `${swap.dex} Trade`,
            timestamp: Date.now(), // You might want to store timestamps in dexDistribution
            amount: swap.volume,
            icon: '🔄',
        })),
        // Add token activities
        ...metrics.tokenMetrics.map((token) => ({
            type: 'Token Activity',
            description: `${token.symbol}`,
            timestamp: token.lastActivity,
            amount: token.volume24h,
            icon: '💰',
        })),
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
                            <p className="font-medium">{activity.type}</p>
                            <p className="text-sm text-muted-foreground">
                                {activity.description} •{' '}
                                {new Date(activity.timestamp).toLocaleString()}
                            </p>
                        </div>
                    </div>
                    <div className="text-sm">
                        {activity.amount
                            ? `${activity.amount.toFixed(4)} SOL`
                            : '-'}
                    </div>
                </div>
            ))}
        </div>
    );
}

function WarningItem({ warning }: { warning: string }) {
    return (
        <div className="flex items-center gap-3 rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm">
            <AlertCircleIcon className="h-4 w-4 text-destructive" />
            <p>{warning}</p>
        </div>
    );
}
