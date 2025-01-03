// src/hooks/use-wallet-analysis.ts
import { useState, useEffect, useCallback } from 'react';
import { DetailedMetrics, MarketContext } from '@/lib/types/analytics';
import { TransactionData, TokenTransfer } from '@/lib/types/transaction';
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

    const fetchAnalysis = useCallback(async () => {
        if (!address) return;

        try {
            setState(prev => ({ ...prev, loading: true }));
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
                if (options.refreshInterval && isMounted) {
                    refreshTimeout = setTimeout(performAnalysis, options.refreshInterval);
                }
            } catch (error) {
                console.error('Analysis error:', error);
            }
        };

        performAnalysis();

        return () => {
            isMounted = false;
            if (refreshTimeout) clearTimeout(refreshTimeout);
        };
    }, [fetchAnalysis, options.refreshInterval]);

    const refresh = useCallback(async () => {
        setState(prev => ({ ...prev, loading: true }));
        return fetchAnalysis();
    }, [fetchAnalysis]);

    return { ...state, refresh };
}

export function useTokenAnalysis(metrics: DetailedMetrics | null) {
    const tokenMetrics = metrics?.tokenMetrics || [];
    const uniqueTokens = new Set(tokenMetrics.map(t => t.mint));

    return {
        topTokens: tokenMetrics.slice(0, 5),
        tokenCount: uniqueTokens.size,
        totalValue: metrics?.overview?.totalVolume || 0,
        performanceByToken: tokenMetrics.map(token => ({
            symbol: token.symbol,
            mint: token.mint,
            volume: token.volume24h,
            profitLoss: token.profitLoss,
            holdingPeriod: token.holdingPeriod,
            riskScore: token.riskScore,
            lastActivity: new Date(token.lastActivity * 1000).toISOString(),
            transactions: token.transactions
        })),
        tokenDistribution: calculateTokenDistribution(tokenMetrics),
        holdingStats: calculateHoldingStats(tokenMetrics)
    };
}

export function useRiskAnalysis(metrics: DetailedMetrics | null) {
    const riskMetrics = metrics?.riskMetrics;
    const tradingStats = metrics?.tradingStats;

    return {
        overallRisk: riskMetrics?.smartContractRisk?.score || 0,
        riskFactors: riskMetrics?.smartContractRisk?.factors || [],
        riskTrend: determineRiskTrend(riskMetrics),
        warnings: riskMetrics?.warnings || [],
        liquidityExposure: riskMetrics?.liquidityExposure || 0,
        marketExposure: riskMetrics?.marketBeta || 0,
        impermanentLoss: riskMetrics?.impermanentLoss || { current: 0, projected: 0 },
        concentrationRisk: {
            tokenLevel: riskMetrics?.concentration?.tokenLevel || 0,
            protocolLevel: riskMetrics?.concentration?.protocolLevel || 0,
            description: determineConcentrationRiskLevel(riskMetrics?.concentration)
        },
        volatilityMetrics: {
            daily: riskMetrics?.var?.daily || 0,
            weekly: riskMetrics?.var?.weekly || 0,
            volatility: tradingStats?.volatility || 0,
            riskAdjustedReturn: tradingStats?.sharpeRatio || 0
        },
        defiExposure: calculateDefiExposure(riskMetrics?.protocolExposure || [])
    };
}

export function usePerformanceMetrics(metrics: DetailedMetrics | null) {
    const tradingStats = metrics?.tradingStats;
    const overview = metrics?.overview;

    return {
        totalReturn: overview?.profitLoss?.total || 0,
        realizedReturn: overview?.profitLoss?.realized || 0,
        unrealizedReturn: overview?.profitLoss?.unrealized || 0,
        winRate: tradingStats?.winRate || 0,
        averageReturn: tradingStats?.averageReturn || 0,
        bestTrade: {
            value: tradingStats?.bestTrade || 0,
            timestamp: findBestTradeTimestamp(metrics),
        },
        worstTrade: {
            value: tradingStats?.worstTrade || 0,
            timestamp: findWorstTradeTimestamp(metrics),
        },
        tradingFrequency: analyzeTradingFrequency(tradingStats?.tradingFrequency || []),
        streaks: {
            currentWinStreak: tradingStats?.successiveWins || 0,
            currentLossStreak: tradingStats?.successiveLosses || 0,
            averageHoldTime: tradingStats?.averageHoldTime || 0
        },
        performance: calculatePerformanceMetrics(metrics)
    };
}

export function useSwapMetrics(metrics: DetailedMetrics | null) {
    const swapMetrics = metrics?.swapMetrics;

    return {
        totalSwaps: swapMetrics?.totalSwaps || 0,
        swapVolume: swapMetrics?.swapVolume || 0,
        averageSwapSize: swapMetrics?.averageSwapSize || 0,
        dexDistribution: analyzeDexDistribution(swapMetrics?.dexDistribution || []),
        slippageStats: swapMetrics?.slippageStats || {
            average: 0,
            median: 0,
            max: 0,
            min: 0,
            standardDeviation: 0
        },
        timing: analyzeSwapTiming(swapMetrics?.timing),
        swapEfficiency: calculateSwapEfficiency(swapMetrics ?? null),
        volumeAnalysis: analyzeVolumeDistribution(swapMetrics ?? null)
    };
}

// Helper functions
function calculateTokenDistribution(tokenMetrics: DetailedMetrics['tokenMetrics']) {
    const total = tokenMetrics.reduce((sum, token) => sum + token.balance, 0);
    return tokenMetrics.map(token => ({
        symbol: token.symbol,
        percentage: (token.balance / total) * 100,
        value: token.balance
    }));
}

function calculateHoldingStats(tokenMetrics: DetailedMetrics['tokenMetrics']) {
    const holdingPeriods = tokenMetrics.map(t => t.holdingPeriod).filter(p => p > 0);
    return {
        averageHoldingPeriod: holdingPeriods.reduce((a, b) => a + b, 0) / holdingPeriods.length,
        maxHoldingPeriod: Math.max(...holdingPeriods),
        minHoldingPeriod: Math.min(...holdingPeriods)
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

// Add these helper functions to your hooks file

function determineConcentrationRiskLevel(concentration: DetailedMetrics['riskMetrics']['concentration'] | undefined): string {
    if (!concentration) return 'Low concentration risk';

    const { tokenLevel, protocolLevel } = concentration;
    if (tokenLevel > 0.7 || protocolLevel > 0.7) return 'High concentration risk';
    if (tokenLevel > 0.4 || protocolLevel > 0.4) return 'Medium concentration risk';
    return 'Low concentration risk';
}

function calculateDefiExposure(protocolExposure: { protocol: string; exposure: number; risk: 'high' | 'medium' | 'low' }[]): {
    totalExposure: number;
    highRiskExposure: number;
    topProtocols: string[];
} {
    const totalExposure = protocolExposure.reduce((sum, p) => sum + p.exposure, 0);
    const highRiskExposure = protocolExposure
        .filter(p => p.risk === 'high')
        .reduce((sum, p) => sum + p.exposure, 0);
    const topProtocols = protocolExposure
        .sort((a, b) => b.exposure - a.exposure)
        .slice(0, 3)
        .map(p => p.protocol);

    return {
        totalExposure,
        highRiskExposure,
        topProtocols
    };
}

function findBestTradeTimestamp(metrics: DetailedMetrics | null): number {
    if (!metrics?.tradingStats?.tradingFrequency) return 0;

    const bestTrade = metrics.tradingStats.tradingFrequency.reduce((best, current) =>
        current.profitLoss > best.profitLoss ? current : best
    );

    return new Date(bestTrade.date).getTime();
}

function findWorstTradeTimestamp(metrics: DetailedMetrics | null): number {
    if (!metrics?.tradingStats?.tradingFrequency) return 0;

    const worstTrade = metrics.tradingStats.tradingFrequency.reduce((worst, current) =>
        current.profitLoss < worst.profitLoss ? current : worst
    );

    return new Date(worstTrade.date).getTime();
}

function analyzeTradingFrequency(frequency: DetailedMetrics['tradingStats']['tradingFrequency']): {
    dailyAverage: number;
    weeklyTrend: 'increasing' | 'decreasing' | 'stable';
    peakTradingDays: string[];
} {
    const dailyAverage = frequency.reduce((sum, day) => sum + day.count, 0) / frequency.length;

    // Calculate weekly trend
    const weeklyVolumes = groupByWeek(frequency);
    const weeklyTrend = determineWeeklyTrend(weeklyVolumes);

    // Find peak trading days
    const peakTradingDays = frequency
        .sort((a, b) => b.count - a.count)
        .slice(0, 3)
        .map(day => day.date);

    return {
        dailyAverage,
        weeklyTrend,
        peakTradingDays
    };
}

function calculatePerformanceMetrics(metrics: DetailedMetrics | null): {
    roi: number;
    riskAdjustedReturn: number;
    averageWinLossRatio: number;
} {
    if (!metrics) return { roi: 0, riskAdjustedReturn: 0, averageWinLossRatio: 0 };

    const totalInvested = metrics.overview.totalVolume;
    const totalReturn = metrics.overview.profitLoss.total;
    const roi = totalInvested > 0 ? (totalReturn / totalInvested) * 100 : 0;

    const riskAdjustedReturn = metrics.tradingStats.sharpeRatio;
    const averageWinLossRatio = calculateWinLossRatio(metrics.tradingStats);

    return {
        roi,
        riskAdjustedReturn,
        averageWinLossRatio
    };
}

function analyzeDexDistribution(dexDistribution: DetailedMetrics['swapMetrics']['dexDistribution']): {
    dominantDex: string;
    diversificationScore: number;
    efficiencyByDex: { dex: string; efficiency: number }[];
} {
    const totalVolume = dexDistribution.reduce((sum, dex) => sum + dex.volume, 0);

    const diversificationScore = calculateDiversificationScore(dexDistribution, totalVolume);
    const dominantDex = dexDistribution[0]?.dex || 'Unknown';

    const efficiencyByDex = dexDistribution.map(dex => ({
        dex: dex.dex,
        efficiency: calculateDexEfficiency(dex)
    }));

    return {
        dominantDex,
        diversificationScore,
        efficiencyByDex
    };
}

function analyzeSwapTiming(timing: DetailedMetrics['swapMetrics']['timing'] | undefined): {
    optimalTradingHours: number[];
    weeklyPattern: { day: string; activity: 'high' | 'medium' | 'low' }[];
} {
    if (!timing) {
        return {
            optimalTradingHours: [],
            weeklyPattern: []
        };
    }

    const weeklyPattern = timing.weekdayDistribution.map(day => ({
        day: day.day,
        activity: determineActivityLevel(day.count)
    }));

    return {
        optimalTradingHours: timing.bestHours,
        weeklyPattern
    };
}

function calculateSwapEfficiency(swapMetrics: DetailedMetrics['swapMetrics'] | null): {
    overallEfficiency: number;
    slippageScore: number;
    costEfficiency: number;
} {
    if (!swapMetrics) return { overallEfficiency: 0, slippageScore: 0, costEfficiency: 0 };

    const slippageScore = calculateSlippageScore(swapMetrics.slippageStats);
    const costEfficiency = calculateCostEfficiency(swapMetrics);
    const overallEfficiency = (slippageScore + costEfficiency) / 2;

    return {
        overallEfficiency,
        slippageScore,
        costEfficiency
    };
}

function analyzeVolumeDistribution(swapMetrics: DetailedMetrics['swapMetrics'] | null): {
    volumeProfile: 'high' | 'medium' | 'low';
    consistency: number;
    trendAnalysis: string;
} {
    if (!swapMetrics) {
        return {
            volumeProfile: 'low',
            consistency: 0,
            trendAnalysis: 'Insufficient data'
        };
    }

    const averageVolume = swapMetrics.swapVolume / Math.max(swapMetrics.totalSwaps, 1);
    const volumeProfile = determineVolumeProfile(averageVolume);
    const consistency = calculateVolumeConsistency(swapMetrics);

    return {
        volumeProfile,
        consistency,
        trendAnalysis: analyzeTrend(swapMetrics)
    };
}

// Additional helper functions
function groupByWeek(frequency: DetailedMetrics['tradingStats']['tradingFrequency']): number[] {
    const weeklyVolumes: number[] = [];
    let currentWeekVolume = 0;
    let currentWeekStart = 0;

    frequency.forEach((day, index) => {
        if (index % 7 === 0 && index > 0) {
            weeklyVolumes.push(currentWeekVolume);
            currentWeekVolume = 0;
        }
        currentWeekVolume += day.volume;
    });
    weeklyVolumes.push(currentWeekVolume);

    return weeklyVolumes;
}

function determineWeeklyTrend(weeklyVolumes: number[]): 'increasing' | 'decreasing' | 'stable' {
    const lastWeeks = weeklyVolumes.slice(-4);
    const trend = lastWeeks[lastWeeks.length - 1] - lastWeeks[0];

    if (trend > lastWeeks[0] * 0.1) return 'increasing';
    if (trend < -lastWeeks[0] * 0.1) return 'decreasing';
    return 'stable';
}

function calculateWinLossRatio(tradingStats: DetailedMetrics['tradingStats']): number {
    if (!tradingStats.bestTrade || !tradingStats.worstTrade) return 0;
    return Math.abs(tradingStats.bestTrade / tradingStats.worstTrade);
}

function calculateDiversificationScore(dexDistribution: DetailedMetrics['swapMetrics']['dexDistribution'], totalVolume: number): number {
    if (totalVolume === 0) return 0;

    return 1 - dexDistribution.reduce((score, dex) =>
        score + Math.pow(dex.volume / totalVolume, 2), 0);
}

function calculateDexEfficiency(dex: { volume: number; count: number; avgSlippage: number }): number {
    const volumeScore = Math.min(dex.volume / 1000000, 1); // Normalize to 1
    const slippageScore = 1 - Math.min(dex.avgSlippage / 10, 1);
    return (volumeScore + slippageScore) / 2;
}

function determineActivityLevel(count: number): 'high' | 'medium' | 'low' {
    if (count > 10) return 'high';
    if (count > 5) return 'medium';
    return 'low';
}

function calculateSlippageScore(slippageStats: DetailedMetrics['swapMetrics']['slippageStats']): number {
    return 1 - Math.min(slippageStats.average / 10, 1);
}

function calculateCostEfficiency(swapMetrics: DetailedMetrics['swapMetrics']): number {
    const averageSize = swapMetrics.averageSwapSize;
    if (averageSize === 0) return 0;

    // Assuming larger trades are more cost-efficient
    return Math.min(averageSize / 1000, 1);
}

function determineVolumeProfile(averageVolume: number): 'high' | 'medium' | 'low' {
    if (averageVolume > 10000) return 'high';
    if (averageVolume > 1000) return 'medium';
    return 'low';
}

function calculateVolumeConsistency(swapMetrics: DetailedMetrics['swapMetrics']): number {
    if (!swapMetrics.timing.weekdayDistribution.length) return 0;

    const volumes = swapMetrics.timing.weekdayDistribution.map(d => d.volume);
    const mean = volumes.reduce((a, b) => a + b, 0) / volumes.length;
    const variance = volumes.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / volumes.length;

    return 1 / (1 + Math.sqrt(variance) / mean);
}

function analyzeTrend(swapMetrics: DetailedMetrics['swapMetrics']): string {
    const distribution = swapMetrics.timing.weekdayDistribution;
    if (distribution.length < 2) return 'Insufficient data';

    const firstHalf = distribution.slice(0, Math.floor(distribution.length / 2));
    const secondHalf = distribution.slice(Math.floor(distribution.length / 2));

    const firstHalfAvg = firstHalf.reduce((sum, d) => sum + d.volume, 0) / firstHalf.length;
    const secondHalfAvg = secondHalf.reduce((sum, d) => sum + d.volume, 0) / secondHalf.length;

    const change = ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100;

    if (change > 10) return 'Increasing volume trend';
    if (change < -10) return 'Decreasing volume trend';
    return 'Stable volume trend';
}