// app/wallet/[address]/page.tsx
'use client';
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import {
    ActivityIcon, AlertCircleIcon, BarChart3Icon, ClockIcon,
    CoinsIcon, NetworkIcon, RefreshCwIcon, TrendingUpIcon, WalletIcon,
} from 'lucide-react';
import {
    Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie,
    PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { fetchWalletData } from '@/lib/api';
import type { AIInsight, DeFiPosition, WalletMetrics } from '@/types/analytics';
import Image from 'next/image';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function WalletDashboard() {
    const params = useParams();
    const address =
        typeof params?.address === 'string'
            ? decodeURIComponent(params.address)
            : '';

    const [data, setData] = useState<WalletMetrics | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            const walletData = await fetchWalletData(address);
            setData(walletData);
            setError(null);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err
                    : new Error('Failed to fetch wallet data'),
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (address) {
            fetchData();
        }
    }, [address]);

    if (!address)
        return (
            <ErrorState
                error={new Error('Invalid wallet address')}
                onRetry={() => {}}
            />
        );
    if (loading) return <LoadingState />;
    if (error) return <ErrorState error={error} onRetry={fetchData} />;
    if (!data) return null;

    return (
        <div className="min-h-screen bg-background p-6">
            <Header address={address} data={data} onRefresh={fetchData} />
            <QuickMetrics data={data} />

            <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
                <PortfolioPerformance data={data} />
                <TradingActivity data={data} />
            </div>

            <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
                <TokenHoldings data={data} />
                <DeFiPositions data={data} />
                <RiskAnalysis data={data} />
            </div>

            <AIRecommendations insights={data.aiInsights} />
        </div>
    );
}

function Header({
    address,
    data,
    onRefresh,
}: {
    address: string;
    data: WalletMetrics;
    onRefresh: () => void;
}) {
    return (
        <div className="mb-8 flex items-center justify-between">
            <div>
                <h1 className="text-2xl font-bold text-foreground">
                    Wallet Analytics
                </h1>
                <p className="text-sm text-muted-foreground">{address}</p>
                <div className="mt-2 flex gap-2">
                    <Badge variant="outline">Age: {data.accountAge} days</Badge>
                    <Badge
                        variant="outline"
                        className={
                            data.riskScore < 30
                                ? 'bg-green-100'
                                : data.riskScore < 70
                                  ? 'bg-yellow-100'
                                  : 'bg-red-100'
                        }>
                        Risk Score: {data.riskScore}/100
                    </Badge>
                </div>
            </div>
            <Button onClick={onRefresh} className="flex items-center gap-2">
                <RefreshCwIcon className="h-4 w-4" />
                Refresh
            </Button>
        </div>
    );
}

function QuickMetrics({ data }: { data: WalletMetrics }) {
    const metrics = [
        {
            title: 'Portfolio Value',
            value: `$${data.totalValue.toLocaleString()}`,
            change: data.valueChange24h,
            icon: WalletIcon,
        },
        {
            title: 'Trading Activity',
            value: `${data.transactions.length} Txns`,
            change: data.performanceMetrics.winRate * 100,
            icon: ActivityIcon,
        },
        {
            title: 'Performance',
            value: `${(data.performanceMetrics.monthlyReturn * 100).toFixed(2)}%`,
            change: data.performanceMetrics.sharpeRatio,
            icon: BarChart3Icon,
        },
        {
            title: 'Risk Level',
            value: `${data.riskScore}/100`,
            change: data.performanceMetrics.dailyReturn * 100,
            icon: AlertCircleIcon,
            neutral: true,
        },
    ];

    return (
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {metrics.map((metric) => (
                <Card key={metric.title} className="p-6">
                    <div className="flex items-center justify-between">
                        <metric.icon className="h-5 w-5 text-muted-foreground" />
                        {!metric.neutral && (
                            <Badge
                                variant={
                                    metric.change >= 0
                                        ? 'default'
                                        : 'destructive'
                                }>
                                {metric.change >= 0 ? '+' : ''}
                                {metric.change.toFixed(2)}%
                            </Badge>
                        )}
                    </div>
                    <h3 className="mt-4 text-sm font-medium text-muted-foreground">
                        {metric.title}
                    </h3>
                    <p className="mt-2 text-2xl font-bold">{metric.value}</p>
                </Card>
            ))}
        </div>
    );
}

function PortfolioPerformance({ data }: { data: WalletMetrics }) {
    const performanceData = data.transactions.reduce(
        (acc, tx) => {
            const date = new Date(tx.timestamp * 1000).toLocaleDateString();
            if (!acc[date]) {
                acc[date] = { date, value: 0 };
            }
            acc[date].value += tx.value;
            return acc;
        },
        {} as Record<string, { date: string; value: number }>,
    );

    const chartData = Object.values(performanceData);

    return (
        <Card className="p-6">
            <CardHeader>
                <CardTitle>Portfolio Performance</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                            <CartesianGrid
                                strokeDasharray="3 3"
                                className="opacity-50"
                            />
                            <XAxis
                                dataKey="date"
                                tick={{ fontSize: 12 }}
                                tickFormatter={(value) => value.split(',')[0]}
                            />
                            <YAxis
                                tick={{ fontSize: 12 }}
                                tickFormatter={(value) =>
                                    `$${value.toLocaleString()}`
                                }
                            />
                            <Tooltip
                                formatter={(value: number) => [
                                    `$${value.toLocaleString()}`,
                                ]}
                                labelFormatter={(label) =>
                                    new Date(label).toLocaleDateString()
                                }
                            />
                            <Line
                                type="monotone"
                                dataKey="value"
                                stroke="#8884d8"
                                strokeWidth={2}
                                dot={false}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-4">
                    <div>
                        <p className="text-sm text-muted-foreground">
                            Daily Return
                        </p>
                        <p className="font-medium">
                            {(
                                data.performanceMetrics.dailyReturn * 100
                            ).toFixed(2)}
                            %
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">
                            Monthly Return
                        </p>
                        <p className="font-medium">
                            {(
                                data.performanceMetrics.monthlyReturn * 100
                            ).toFixed(2)}
                            %
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">
                            Sharpe Ratio
                        </p>
                        <p className="font-medium">
                            {data.performanceMetrics.sharpeRatio.toFixed(2)}
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

function TradingActivity({ data }: { data: WalletMetrics }) {
    const activityData = data.transactions.reduce(
        (acc, tx) => {
            const type = tx.type;
            if (!acc[type]) {
                acc[type] = { type, count: 0, volume: 0 };
            }
            acc[type].count++;
            acc[type].volume += tx.value;
            return acc;
        },
        {} as Record<string, { type: string; count: number; volume: number }>,
    );

    const chartData = Object.values(activityData);

    return (
        <Card className="p-6">
            <CardHeader>
                <CardTitle>Trading Activity</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                            <CartesianGrid
                                strokeDasharray="3 3"
                                className="opacity-50"
                            />
                            <XAxis dataKey="type" />
                            <YAxis
                                yAxisId="left"
                                orientation="left"
                                stroke="#8884d8"
                            />
                            <YAxis
                                yAxisId="right"
                                orientation="right"
                                stroke="#82ca9d"
                            />
                            <Tooltip />
                            <Bar
                                yAxisId="left"
                                dataKey="count"
                                fill="#8884d8"
                                name="Count"
                            />
                            <Bar
                                yAxisId="right"
                                dataKey="volume"
                                fill="#82ca9d"
                                name="Volume"
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-4">
                    <div>
                        <p className="text-sm text-muted-foreground">
                            Total Trades
                        </p>
                        <p className="font-medium">
                            {data.transactions.length}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">
                            Success Rate
                        </p>
                        <p className="font-medium">
                            {(
                                (data.transactions.filter((tx) => tx.success)
                                    .length /
                                    data.transactions.length) *
                                100
                            ).toFixed(1)}
                            %
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">
                            Win Rate
                        </p>
                        <p className="font-medium">
                            {(data.performanceMetrics.winRate * 100).toFixed(1)}
                            %
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

function TokenHoldings({ data }: { data: WalletMetrics }) {
    return (
        <Card className="p-6">
            <CardHeader>
                <CardTitle>Token Holdings</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {data.holdings.map((token, index) => (
                        <div
                            key={token.symbol}
                            className="flex items-center justify-between rounded-lg border p-3">
                            <div className="flex items-center gap-3">
                                {token.logoUrl && (
                                    <Image
                                        src={token.logoUrl}
                                        alt={token.symbol}
                                        width={32}
                                        height={32}
                                        className="rounded-full"
                                    />
                                )}
                                <div>
                                    <p className="font-medium">
                                        {token.symbol}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {token.name}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="font-medium">
                                    ${token.value.toLocaleString()}
                                </p>
                                <p
                                    className={`text-sm ${token.change24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                    {token.change24h >= 0 ? '+' : ''}
                                    {token.change24h.toFixed(2)}%
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

function DeFiPositions({ data }: { data: WalletMetrics }) {
    const positionsByType = data.defiPositions.reduce(
        (acc, pos) => {
            acc[pos.type] = (acc[pos.type] || 0) + pos.value;
            return acc;
        },
        {} as Record<DeFiPosition['type'], number>,
    );

    const pieData = Object.entries(positionsByType).map(([type, value]) => ({
        name: type,
        value,
    }));

    return (
        <Card className="p-6">
            <CardHeader>
                <CardTitle>DeFi Positions</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="mb-4 h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={pieData}
                                cx="50%"
                                cy="50%"
                                outerRadius={80}
                                dataKey="value"
                                label>
                                {pieData.map((_, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={COLORS[index % COLORS.length]}
                                    />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <div className="space-y-4">
                    {data.defiPositions.map((position) => (
                        <div
                            key={`${position.protocol}-${position.asset}`}
                            className="flex items-center justify-between rounded-lg border p-3">
                            <div>
                                <p className="font-medium">
                                    {position.protocol}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {position.asset}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="font-medium">
                                    ${position.value.toLocaleString()}
                                </p>
                                <p className="text-sm text-green-500">
                                    {position.apy}% APY
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

function RiskAnalysis({ data }: { data: WalletMetrics }) {
    return (
        <Card className="p-6">
            <CardHeader>
                <CardTitle>Risk Analysis</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {data.aiInsights
                        .filter((insight) => insight.type === 'RISK')
                        .map((insight, index) => (
                            <div key={index} className="rounded-lg border p-4">
                                <div className="mb-2 flex items-center gap-2">
                                    <AlertCircleIcon className="h-4 w-4 text-red-500" />
                                    <h4 className="font-medium">
                                        {insight.title}
                                    </h4>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    {insight.description}
                                </p>
                                {insight.action && (
                                    <p className="mt-2 text-sm text-blue-500">
                                        {insight.action}
                                    </p>
                                )}
                            </div>
                        ))}
                </div>
            </CardContent>
        </Card>
    );
}

function AIRecommendations({ insights }: { insights: AIInsight[] }) {
    return (
        <Card className="p-6">
            <CardHeader>
                <CardTitle>AI-Powered Insights</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {insights
                        .filter(
                            (insight) =>
                                insight.type === 'OPPORTUNITY' ||
                                insight.type === 'RECOMMENDATION',
                        )
                        .map((insight, index) => (
                            <div key={index} className="rounded-lg border p-4">
                                <div className="mb-2 flex items-center gap-2">
                                    <Badge
                                        variant={
                                            insight.impact === 'HIGH'
                                                ? 'destructive'
                                                : 'secondary'
                                        }>
                                        {insight.impact}
                                    </Badge>
                                    <span className="text-sm text-muted-foreground">
                                        {Math.round(insight.confidence * 100)}%
                                        confidence
                                    </span>
                                </div>
                                <h4 className="mb-2 font-medium">
                                    {insight.title}
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                    {insight.description}
                                </p>
                                {insight.action && (
                                    <p className="mt-2 text-sm font-medium text-blue-500">
                                        {insight.action}
                                    </p>
                                )}
                            </div>
                        ))}
                </div>
            </CardContent>
        </Card>
    );
}

function LoadingState() {
    return (
        <div className="p-6">
            <Skeleton className="mb-8 h-8 w-64" />
            <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-32" />
                ))}
            </div>
            <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
                <Skeleton className="h-[400px]" />
                <Skeleton className="h-[400px]" />
            </div>
        </div>
    );
}

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