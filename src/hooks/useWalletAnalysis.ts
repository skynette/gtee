// src/hooks/use-wallet-analysis.ts
import { useState, useEffect, useCallback } from 'react';
import { DetailedMetrics, MarketContext } from '@/lib/types/analytics';
import { ANALYSIS_CONFIG } from '@/config/analysis-config';

interface AnalysisState {
    metrics: DetailedMetrics | null;
    loading: boolean;
    error: Error | null;
    lastUpdated: number | null;
}

export function useWalletAnalysis(address: string, options = {
    refreshInterval: ANALYSIS_CONFIG.refreshInterval,
    includeMarketContext: true
}) {
    const [state, setState] = useState<AnalysisState>({
        metrics: null,
        loading: true,
        error: null,
        lastUpdated: null
    });

    const [marketData, setMarketData] = useState<MarketContext | null>(null);

    // Define fetchAnalysis as a useCallback hook
    const fetchAnalysis = useCallback(async () => {
        if (!address) return;

        try {
            setState(prev => ({ ...prev, loading: true }));

            // Fetch analysis from API endpoint
            const response = await fetch(`/api/analyze-wallet?address=${encodeURIComponent(address)}`);

            if (!response.ok) {
                throw new Error(`Analysis failed: ${response.statusText}`);
            }

            const data = await response.json();

            setState({
                metrics: data.metrics,
                loading: false,
                error: null,
                lastUpdated: Date.now()
            });

            return data;
        } catch (error) {
            setState(prev => ({
                ...prev,
                loading: false,
                error: error as Error
            }));
            throw error;
        }
    }, [address]);

    useEffect(() => {
        let isMounted = true;
        let refreshTimeout: NodeJS.Timeout;

        const performAnalysis = async () => {
            try {
                if (isMounted) {
                    await fetchAnalysis();
                }

                // Schedule next refresh
                if (options.refreshInterval && isMounted) {
                    refreshTimeout = setTimeout(performAnalysis, options.refreshInterval);
                }
            } catch (error) {
                console.error('Analysis error:', error);
            }
        };

        performAnalysis();

        // Cleanup
        return () => {
            isMounted = false;
            if (refreshTimeout) {
                clearTimeout(refreshTimeout);
            }
        };
    }, [fetchAnalysis, options.refreshInterval]);

    const refresh = useCallback(async () => {
        setState(prev => ({ ...prev, loading: true }));
        return fetchAnalysis();
    }, [fetchAnalysis]);

    return {
        ...state,
        refresh,
        marketContext: marketData
    };
}

// Other hooks remain the same...
export function useTokenAnalysis(metrics: DetailedMetrics | null) {
    return {
        topTokens: metrics?.tokenMetrics?.slice(0, 5) || [],
        tokenCount: metrics?.tokenMetrics?.length || 0,
        totalValue: metrics?.overview?.totalVolume || 0,
        performanceByToken: metrics?.tokenMetrics?.map(token => ({
            symbol: token.symbol,
            volume: token.volume24h,
            profitLoss: token.profitLoss
        })) || []
    };
}

export function useRiskAnalysis(metrics: DetailedMetrics | null) {
    const riskMetrics = metrics?.riskMetrics;

    return {
        overallRisk: riskMetrics?.smartContractRisk?.score || 0,
        riskFactors: riskMetrics?.smartContractRisk?.factors || [],
        riskTrend: determineRiskTrend(riskMetrics),
        warnings: riskMetrics?.warnings || [],
        liquidityExposure: riskMetrics?.liquidityExposure || 0,
        marketExposure: riskMetrics?.marketBeta || 0,
        impermanentLoss: riskMetrics?.impermanentLoss || { current: 0, projected: 0 }
    };
}

export function usePerformanceMetrics(metrics: DetailedMetrics | null) {
    const tradingStats = metrics?.tradingStats;
    const overview = metrics?.overview;

    return {
        totalReturn: overview?.profitLoss?.total || 0,
        winRate: tradingStats?.winRate || 0,
        averageReturn: tradingStats?.averageReturn || 0,
        bestTrade: tradingStats?.bestTrade || null,
        worstTrade: tradingStats?.worstTrade || null,
        tradingFrequency: tradingStats?.tradingFrequency || [],
        successiveWins: tradingStats?.successiveWins || 0,
        successiveLosses: tradingStats?.successiveLosses || 0
    };
}

export function useSwapMetrics(metrics: DetailedMetrics | null) {
    return {
        totalSwaps: metrics?.swapMetrics?.totalSwaps || 0,
        swapVolume: metrics?.swapMetrics?.swapVolume || 0,
        averageSwapSize: metrics?.swapMetrics?.averageSwapSize || 0,
        dexDistribution: metrics?.swapMetrics?.dexDistribution || [],
        slippageStats: metrics?.swapMetrics?.slippageStats || {
            average: 0,
            median: 0,
            max: 0,
            min: 0,
            standardDeviation: 0
        },
        timing: metrics?.swapMetrics?.timing || {
            bestHours: [],
            worstHours: [],
            weekdayDistribution: []
        }
    };
}

// Helper function to determine risk trend
function determineRiskTrend(riskMetrics: DetailedMetrics['riskMetrics'] | undefined): 'increasing' | 'decreasing' | 'stable' {
    if (!riskMetrics) return 'stable';

    const currentDrawdown = riskMetrics.drawdown?.current;
    const maxDrawdown = riskMetrics.drawdown?.max;

    if (currentDrawdown > (maxDrawdown * 0.8)) return 'increasing';
    if (currentDrawdown < (maxDrawdown * 0.2)) return 'decreasing';
    return 'stable';
}