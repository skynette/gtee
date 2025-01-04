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
import { useEffect, useState } from 'react';

export default function DashboardPage() {
    const params = useParams();
    const queryClient = useQueryClient();

    const address =
        typeof params?.address === 'string'
            ? decodeURIComponent(params.address)
            : '';

    const [loading, setLoading] = useState(false); // Initial loading state set to true

    // Retrieve executionId from localStorage
    const executionId = localStorage.getItem("executionId");

    // Polling query for task status
    const taskQuery = useQuery<TaskStatusResponse, Error>(
        ["taskStatus", executionId],
        () => getTradingDataTask(executionId as string),
        {
            enabled: !!executionId,
            refetchInterval: (data: TaskStatusResponse | undefined) =>
                data && data.data && !data.data.is_execution_finished ? 20000 : false,
            refetchOnMount: false,
            cacheTime: 100000,
            onSuccess: (data: TaskStatusResponse) => {
                if (data.data.is_execution_finished) {
                    queryClient.invalidateQueries(["taskStatus"]);

                    // Clear executionId from localStorage once the task is complete
                    localStorage.removeItem("executionId");

                    // Set loading to false when data is available
                    setLoading(false);
                }
            },
            onError: () => {
                // Handle error and set loading to false
                setLoading(false);
            }
        }
    );

    // Combine isLoading and isFetching for continuous loading state
    const { isLoading, isFetching, isError, data } = taskQuery;

    // Combine isLoading and isFetching for continuous loading state
    const isLoadingState = isLoading || isFetching || loading;

    useEffect(() => {
        const storedExecutionId = localStorage.getItem("executionId");
        if (storedExecutionId) {
            setLoading(true);
        }
    }, []);

    if (!address)
        return (
            <ErrorState
                error={new Error('Invalid wallet address')}
                onRetry={() => (window.location.href = '/')}
            />
        );

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
                            0x1234...abcd
                        </p>
                        <p className="text-sm text-muted-foreground">
                            Account Age: 365 days
                        </p>
                    </div>
                    <Button className="flex items-center gap-2">
                        <RefreshCcwIcon className="h-4 w-4" />
                        Refresh
                    </Button>
                </div>
            </div>

            {/* Key Metrics Grid */}
            <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {isLoadingState ? (
                    Array.from({ length: 4 }).map((_, index) => (
                        <Skeleton key={index} className="h-24 w-full" />
                    ))
                ) : (
                    <>
                        <MetricCard
                            title="Portfolio Value"
                            value={"$10,000"}
                            icon={WalletIcon}
                            trend={{
                                value: 5.2,
                                positive: true,
                            }}
                            subtitle={`5 Tokens`}
                        />
                        <MetricCard
                            title="Trading Activity"
                            value={`50 Swaps`}
                            icon={ActivityIcon}
                            trend={{
                                value: 12,
                                positive: true,
                            }}
                            subtitle={`$15,000 Volume`}
                        />
                        <MetricCard
                            title="Performance"
                            value={`60% Win Rate`}
                            icon={BarChart3Icon}
                            trend={{
                                value: 3.5,
                                positive: true,
                            }}
                            subtitle={`3 Win Streak`}
                        />
                        <MetricCard
                            title="Risk Profile"
                            value={`70/100`}
                            icon={AlertCircleIcon}
                            trend={{
                                value: 0.08,
                                positive: false,
                                neutral: true,
                            }}
                            subtitle={`Low Concentration`}
                        />
                    </>
                )}
            </div>

            {/* Performance and Trading Statistics */}
            <div className="mb-8 grid gap-6 lg:grid-cols-2">
                {isLoadingState ? (
                    <Skeleton className="h-[300px] w-full" />
                ) : (
                    <Card className="p-6">
                        <h3 className="mb-4 text-lg font-semibold">
                            Performance Over Time
                        </h3>
                        <div className="h-[300px]">
                            <PerformanceChart
                                data={[{ date: "2024-01-01", value: 1000 }]}
                            />
                        </div>
                    </Card>
                )}

                {isLoadingState ? (
                    <Skeleton className="h-[300px] w-full" />
                ) : (
                    <Card className="p-6">
                        <h3 className="mb-4 text-lg font-semibold">DEX Activity</h3>
                        <div className="space-y-4">
                            <DexRow
                                rank={1}
                                dex="Uniswap"
                                efficiency={95}
                                volume={10000}
                            />
                            <DexRow
                                rank={2}
                                dex="Sushiswap"
                                efficiency={80}
                                volume={10000}
                            />
                        </div>
                    </Card>
                )}
            </div>

            {/* Token Holdings and Risk Analysis */}
            <div className="grid gap-6 lg:grid-cols-3">
                {isLoadingState ? (
                    <Skeleton className="h-60 w-full" />
                ) : (
                    <div className="lg:col-span-2">
                        <Card className="p-6">
                            <h3 className="mb-4 text-lg font-semibold">
                                Token Holdings
                            </h3>
                            <div className="space-y-4">
                                <TokenRow
                                    rank={1}
                                    token={{
                                        symbol: "ETH",
                                        percentage: 50,
                                        value: 10000,
                                        profitLoss: 10,
                                    }}
                                />
                                <TokenRow
                                    rank={2}
                                    token={{
                                        symbol: "BTC",
                                        percentage: 30,
                                        value: 3000,
                                        profitLoss: 15,
                                    }}
                                />
                            </div>
                        </Card>
                    </div>
                )}

                {isLoadingState ? (
                    <Skeleton className="h-60 w-full" />
                ) : (
                    <Card className="p-6">
                        <h3 className="mb-4 text-lg font-semibold">Risk Analysis</h3>
                        <div className="space-y-4">
                            <WarningItem warning="High exposure to volatile assets" />
                            <WarningItem warning="Low diversification" />
                        </div>
                    </Card>
                )}
            </div>

            {/* Activity Section */}
            <div className="grid gap-6 lg:grid-cols-3">
                {isLoadingState ? (
                    <Skeleton className="h-60 w-full" />
                ) : (
                    <div className="lg:col-span-2">
                        <Card className="p-6">
                            <h3 className="mb-4 text-lg font-semibold">
                                Recent Activity
                            </h3>
                            {/* <ActivityList
                                metrics={[]}
                            /> */}
                        </Card>
                    </div>
                )}
            </div>
        </div>
    );
}
