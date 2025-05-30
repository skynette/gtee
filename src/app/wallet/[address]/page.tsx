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
import MetricCard from './components/metrics-card';
import TokenRow from './components/token-row';
import PerformanceChart from './components/performance';
import WarningItem from './components/warning';
import ErrorState from './components/error';
import { Card } from '@/components/ui/card';
import { getTradingDataTask } from './api/api';
import { useQuery, useQueryClient } from 'react-query';
import { TaskStatusResponse } from '@/lib/types/responses';
import LoadingState from './components/loading-state';
import { FormattedData, formatTradingData } from './api/data-helpers';
import PositionCard from './components/position-card';
import { useEffect, useState } from 'react';

export default function DashboardPage() {
    const params = useParams();
    const queryClient = useQueryClient();

    
    const address =
    typeof params?.address === 'string'
    ? decodeURIComponent(params.address)
    : '';
    
    
    // Retrieve executionId from localStorage
    const [executionId, setExecutionId] = useState<string | null>(null)
    // const executionId = localStorage.getItem("executionId");
    console.log("getting, exec ID", executionId)

    // Polling query for task status
    const taskQuery = useQuery<TaskStatusResponse, Error>(
        ["taskStatus", executionId],
        () => getTradingDataTask(executionId as string),
        {
            enabled: !!address && !!executionId,
            refetchInterval: (data: TaskStatusResponse | undefined) => {
                if (!data?.data || data.data.state !== "QUERY_STATE_COMPLETED") {
                    return 60000;
                }
                return false;
            },
            refetchOnMount: true,
            refetchOnWindowFocus: false,
            refetchOnReconnect: false,
            onSuccess: (data: TaskStatusResponse) => {
                if (data.data.state === "QUERY_STATE_COMPLETED") {
                    queryClient.invalidateQueries(["taskStatus"]);
                    queryClient.cancelQueries(["taskStatus", executionId]);
                }
            },
        }
    );

    useEffect(() => {
        const storedExecutionId = typeof window !== 'undefined' 
            ? localStorage.getItem("executionId")
            : null;
        setExecutionId(storedExecutionId);
    }, []);

    const { data } = taskQuery;
    console.log("exec state", data?.data.state)

    if (!address) {
        return (
            <ErrorState
                error={new Error('Invalid wallet address')}
                onRetry={() => (window.location.href = '/')}
            />
        );
    }

    if (!executionId || data?.data.state !== "QUERY_STATE_COMPLETED") {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6">
                <LoadingState />
            </div>
        );
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
                        {analysis.improvements.length > 0 ? (
                            analysis.improvements.map((improvement, index) => (
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
                            ))
                        ) : (
                            <p className="text-sm text-muted-foreground">
                                No trading analysis available
                            </p>
                        )}
                    </div>
                </Card>

                <Card className="p-6">
                    <h3 className="mb-4 text-lg font-semibold">Risk Warnings</h3>
                    <div className="space-y-4">
                        {analysis.mistakes.length > 0 ? (
                            analysis.mistakes.map((mistake, index) => (
                                <div key={index} className="space-y-2">
                                    <WarningItem warning={mistake.description} />
                                    {mistake.severity === "high" && (
                                        <span className="inline-block rounded-full bg-red-100 px-2 py-1 text-xs text-red-800">
                                            High Risk
                                        </span>
                                    )}
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-muted-foreground">
                                No risk warnings available
                            </p>
                        )}
                    </div>
                </Card>
            </div>
        </div >
    );
}
