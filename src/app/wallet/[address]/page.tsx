'use client';

import { useParams } from 'next/navigation';
import {
    ActivityIcon,
    AlertCircleIcon,
    BarChart3Icon,
    RefreshCcwIcon,
    WalletIcon,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import DexRow from './components/dexrow';
import MetricCard from './components/metrics-card';
import TokenRow from './components/token-row';
import PerformanceChart from './components/performance';
import WarningItem from './components/warning';
import ErrorState from './components/error';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { getTradingDataTask } from './api/api';
import { useQuery, useQueryClient } from 'react-query';
import { TaskStatusResponse } from '@/lib/types/responses';
import LoadingState from './components/loading-state';
import { FormattedData, formatTradingData } from './api/data-helpers';
import PositionCard from './components/position-card';

export default function DashboardPage() {
    const params = useParams();
    const queryClient = useQueryClient();

    const address =
        typeof params?.address === 'string'
            ? decodeURIComponent(params.address)
            : '';


    // Retrieve executionId from localStorage
    const executionId = localStorage.getItem("executionId");

    // Polling query for task status
    const taskQuery = useQuery<TaskStatusResponse, Error>(
        ["taskStatus", executionId],
        () => getTradingDataTask(executionId as string),
        {
            enabled: !!address,
            refetchInterval: (data: TaskStatusResponse | undefined) =>
                data && data.data && !data.data.is_execution_finished ? 20000 : false,
            refetchOnMount: false,
            // cacheTime: 100000,
            onSuccess: (data: TaskStatusResponse) => {
                if (data.data.is_execution_finished) {
                    queryClient.invalidateQueries(["taskStatus"]);
                }
            },
            onError: () => {
            }
        }
    );

    // Combine isLoading and isFetching for continuous loading state
    const { isLoading, isFetching, isError, data } = taskQuery;
    console.log("exec state", data?.data.state)

    // Combine isLoading and isFetching for continuous loading state
    const isLoadingState = isLoading || isFetching;

    if (!address)
        return (
            <ErrorState
                error={new Error('Invalid wallet address')}
                onRetry={() => (window.location.href = '/')}
            />
        );

    if (!address) {
        return (
            <ErrorState
                error={new Error('Invalid wallet address')}
                onRetry={() => (window.location.href = '/')}
            />
        );
    }

    if (data?.data.state !== "QUERY_STATE_COMPLETED") {
        return <LoadingState />;
    }

    const formattedData: FormattedData = formatTradingData(data);
    const {
        trades,
        portfolio_metrics,
        summary_metrics,
        chart_data,
        analysis
    } = formattedData;


    const activePositions = trades?.filter(trade => trade.status === "OPEN") || [];
    const closedPositions = trades?.filter(trade => trade.status === "CLOSED") || [];

    return (
        <div className="min-h-screen bg-background p-6">
            {/* Header with Overview */}
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">
                            Trading Analytics
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            {address}
                        </p>
                    </div>
                    <Button
                        className="flex items-center gap-2"
                        onClick={() => queryClient.invalidateQueries(["taskStatus"])}
                    >
                        <RefreshCcwIcon className="h-4 w-4" />
                        Refresh
                    </Button>
                </div>
            </div>

            {/* Key Metrics Grid */}
            <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <MetricCard
                    title="Portfolio Value"
                    value={`$${summary_metrics?.totalPnL.toLocaleString()}`}
                    icon={WalletIcon}
                    trend={{
                        value: portfolio_metrics?.average_roi || 0,
                        positive: portfolio_metrics?.average_roi > 0,
                    }}
                    subtitle={`${summary_metrics?.totalTrades} Total Trades`}
                />
                <MetricCard
                    title="Win Rate"
                    value={`${(summary_metrics?.winRate * 100).toFixed(1)}%`}
                    icon={ActivityIcon}
                    trend={{
                        value: summary_metrics?.activePositions || 0,
                        positive: true,
                        neutral: true
                    }}
                    subtitle={`${summary_metrics?.activePositions} Active Positions`}
                />
                <MetricCard
                    title="Performance"
                    value={`${portfolio_metrics?.sharpe_ratio.toFixed(2)} SR`}
                    icon={BarChart3Icon}
                    trend={{
                        value: portfolio_metrics?.max_drawdown,
                        positive: false,
                    }}
                    subtitle={`Max Drawdown: ${portfolio_metrics?.max_drawdown.toFixed(2)}%`}
                />
                <MetricCard
                    title="Avg Holding Time"
                    value={`${Math.floor(summary_metrics?.avgHoldingTime || 0)}h`}
                    icon={AlertCircleIcon}
                    trend={{
                        value: 0,
                        neutral: true
                    }}
                    subtitle={`${activePositions.length} Open Trades`}
                />
            </div>

            {/* Active and Closed Positions */}
            <div className="mb-8 grid gap-6 lg:grid-cols-2">
                <Card className="p-6">
                    <h3 className="mb-4 text-lg font-semibold">
                        Active Positions ({activePositions.length})
                    </h3>
                    <div className="space-y-4 max-h-[400px] overflow-y-auto">
                        {activePositions.map((trade, index) => (
                            <PositionCard
                                key={trade.token}
                                rank={index + 1}
                                trade={trade}
                                totalPortfolioValue={summary_metrics.totalPnL}
                            />
                        ))}
                    </div>
                </Card>

                <Card className="p-6">
                    <h3 className="mb-4 text-lg font-semibold">
                        Closed Positions ({closedPositions.length})
                    </h3>
                    <div className="space-y-4 max-h-[400px] overflow-y-auto">
                        {closedPositions.map((trade, index) => (
                            <PositionCard
                                key={trade.token}
                                rank={index + 1}
                                trade={trade}
                                totalPortfolioValue={summary_metrics.totalPnL}
                            />
                        ))}
                    </div>
                </Card>
            </div>

            {/* Performance and Statistics */}
            <div className="mb-8 grid gap-6 lg:grid-cols-2">
                <Card className="p-6">
                    <h3 className="mb-4 text-lg font-semibold">
                        Performance Distribution
                    </h3>
                    <div className="h-[300px]">
                        <PerformanceChart data={chart_data?.positionSizeVsReturns || []} />
                    </div>
                </Card>
                <Card className="p-6">
                    <h3 className="mb-4 text-lg font-semibold">Active Positions</h3>
                    <div className="space-y-4">
                        {activePositions.map((trade, index) => (
                            <TokenRow
                                key={trade.token}
                                rank={index + 1}
                                token={{
                                    symbol: trade.token,
                                    percentage: (trade.entry.amount * trade.entry.price) / summary_metrics?.totalPnL * 100,
                                    value: trade.entry.amount * trade.entry.price,
                                    profitLoss: trade.metrics.roi
                                }}
                            />
                        ))}
                    </div>
                </Card>
            </div>

            {/* Analysis and Risk Warnings */}
            <div className="grid gap-6 lg:grid-cols-3">
                <Card className="lg:col-span-2 p-6">
                    <h3 className="mb-4 text-lg font-semibold">Trading Analysis</h3>
                    <div className="space-y-4">
                        {analysis?.improvements.map((improvement, index) => (
                            <div key={index} className="space-y-2">
                                <h4 className="font-medium">{improvement.category}</h4>
                                <ul className="list-disc pl-4 space-y-1">
                                    {improvement.recommendations.map((rec, idx) => (
                                        <li key={idx} className="text-sm text-muted-foreground">
                                            {rec}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </Card>

                <Card className="p-6">
                    <h3 className="mb-4 text-lg font-semibold">Risk Warnings</h3>
                    <div className="space-y-4">
                        {analysis?.mistakes.map((mistake, index) => (
                            <WarningItem
                                key={index}
                                warning={mistake.description}
                            />
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    );
}
