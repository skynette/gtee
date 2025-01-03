// src/hooks/use-wallet-analysis.ts
import { useState, useEffect } from 'react';
import { AdvancedWalletAnalyzer } from '@/lib/analysis/wallet-analyzer';
import { RuleBasedAnalyzer } from '@/lib/analysis/rule-based-analyzer';
import { DetailedMetrics, MLPredictions, RiskProfile, MarketContext } from '@/lib/types/analytics';
import { ANALYSIS_CONFIG } from '@/config/analysis-config';

interface AnalysisState {
    metrics: DetailedMetrics | null;
    ruleBasedAnalysis: any | null;
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
        ruleBasedAnalysis: null,
        loading: true,
        error: null,
        lastUpdated: null
    });

    const [marketData, setMarketData] = useState<MarketContext | null>(null);

    useEffect(() => {
        let isMounted = true;
        let refreshTimeout: NodeJS.Timeout;

        const fetchMarketData = async () => {
            try {
                // Implement your market data fetching logic here
                const marketContext: MarketContext = {
                    globalVolume24h: 0,
                    topTokens: [],
                    marketTrends: {
                        shortTerm: 'neutral',
                        longTerm: 'neutral'
                    },
                    dexMetrics: []
                };

                if (isMounted) {
                    setMarketData(marketContext);
                }
            } catch (error) {
                console.error('Error fetching market data:', error);
            }
        };

        const analyzeWallet = async () => {
            if (!address) return;

            try {
                setState(prev => ({ ...prev, loading: true }));

                // Initialize analyzers
                const walletAnalyzer = new AdvancedWalletAnalyzer(
                    process.env.NEXT_PUBLIC_HELIUS_API_KEY!,
                    'https://api.mainnet-beta.solana.com',
                    ANALYSIS_CONFIG.modelConfig,
                    marketData
                );

                const ruleAnalyzer = new RuleBasedAnalyzer();

                // Parallel analysis
                const [metrics, marketContext] = await Promise.all([
                    walletAnalyzer.analyzeWallet(address),
                    options.includeMarketContext ? fetchMarketData() : null
                ]);

                // Rule-based analysis
                const ruleBasedAnalysis = ruleAnalyzer.analyze(metrics);

                if (isMounted) {
                    setState({
                        metrics,
                        ruleBasedAnalysis,
                        loading: false,
                        error: null,
                        lastUpdated: Date.now()
                    });
                }

                // Schedule next refresh
                if (options.refreshInterval) {
                    refreshTimeout = setTimeout(analyzeWallet, options.refreshInterval);
                }
            } catch (error) {
                if (isMounted) {
                    setState(prev => ({
                        ...prev,
                        loading: false,
                        error: error as Error
                    }));
                }
            }
        };

        analyzeWallet();

        // Cleanup
        return () => {
            isMounted = false;
            if (refreshTimeout) {
                clearTimeout(refreshTimeout);
            }
        };
    }, [address, options.refreshInterval, options.includeMarketContext]);

    // Helper function to check if data needs refresh
    const isStale = () => {
        if (!state.lastUpdated) return true;
        return Date.now() - state.lastUpdated > options.refreshInterval;
    };

    // Force refresh function
    const refresh = async () => {
        setState(prev => ({ ...prev, loading: true }));
        const walletAnalyzer = new AdvancedWalletAnalyzer(
            process.env.NEXT_PUBLIC_HELIUS_API_KEY!,
            'https://api.mainnet-beta.solana.com',
            ANALYSIS_CONFIG.modelConfig,
            marketData
        );

        try {
            const metrics = await walletAnalyzer.analyzeWallet(address);
            const ruleAnalyzer = new RuleBasedAnalyzer();
            const ruleBasedAnalysis = ruleAnalyzer.analyze(metrics);

            setState({
                metrics,
                ruleBasedAnalysis,
                loading: false,
                error: null,
                lastUpdated: Date.now()
            });
        } catch (error) {
            setState(prev => ({
                ...prev,
                loading: false,
                error: error as Error
            }));
        }
    };

    return {
        ...state,
        isStale: isStale(),
        refresh,
        marketContext: marketData
    };
}

export function useTokenAnalysis(metrics: DetailedMetrics | null) {
    return {
        topTokens: metrics?.tokenMetrics.slice(0, 5) || [],
        tokenCount: metrics?.tokenMetrics.length || 0,
        totalValue: metrics?.overview.totalVolume || 0, // Fixed: using totalVolume instead of totalValue
        performanceByToken: metrics?.tokenMetrics.map(token => ({
            symbol: token.symbol,
            volume: token.volume24h, // Fixed: using volume24h instead of volume
            profitLoss: token.profitLoss // Added profitLoss for performance metric
        })) || []
    };
}

export function useRiskAnalysis(metrics: DetailedMetrics | null) {
    const riskMetrics = metrics?.riskMetrics;

    return {
        overallRisk: riskMetrics?.smartContractRisk.score || 0, // Fixed: using specific risk score
        riskFactors: riskMetrics?.smartContractRisk.factors || [],
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
        totalReturn: overview?.profitLoss.total || 0, // Fixed: using correct path to total profit/loss
        winRate: tradingStats?.winRate || 0,
        averageReturn: tradingStats?.averageReturn || 0,
        bestTrade: tradingStats?.bestTrade || null,
        worstTrade: tradingStats?.worstTrade || null,
        tradingFrequency: tradingStats?.tradingFrequency || [],
        successiveWins: tradingStats?.successiveWins || 0,
        successiveLosses: tradingStats?.successiveLosses || 0
    };
}

function determineRiskTrend(riskMetrics: DetailedMetrics['riskMetrics'] | undefined): 'increasing' | 'decreasing' | 'stable' {
    if (!riskMetrics) return 'stable';

    const currentDrawdown = riskMetrics.drawdown.current;
    const maxDrawdown = riskMetrics.drawdown.max;

    if (currentDrawdown > maxDrawdown * 0.8) return 'increasing';
    if (currentDrawdown < maxDrawdown * 0.2) return 'decreasing';
    return 'stable';
}

export function useAIInsights(metrics: DetailedMetrics | null) {
    return {
        summary: metrics?.aiInsights.summary || '',
        tradingStyle: metrics?.aiInsights.tradingStyle || '',
        strengths: metrics?.aiInsights.strengthsWeaknesses.strengths || [],
        weaknesses: metrics?.aiInsights.strengthsWeaknesses.weaknesses || [],
        opportunities: metrics?.aiInsights.opportunities || [],
        recommendations: metrics?.aiInsights.recommendations || [],
        marketContext: metrics?.aiInsights.marketContext || {
            position: '',
            sentiment: '',
            keyFactors: []
        }
    };
}

export function useSwapMetrics(metrics: DetailedMetrics | null) {
    return {
        totalSwaps: metrics?.swapMetrics.totalSwaps || 0,
        swapVolume: metrics?.swapMetrics.swapVolume || 0,
        averageSwapSize: metrics?.swapMetrics.averageSwapSize || 0,
        dexDistribution: metrics?.swapMetrics.dexDistribution || [],
        slippageStats: metrics?.swapMetrics.slippageStats || {
            average: 0,
            median: 0,
            max: 0,
            min: 0,
            standardDeviation: 0
        },
        timing: metrics?.swapMetrics.timing || {
            bestHours: [],
            worstHours: [],
            weekdayDistribution: []
        }
    };
}
