// src/lib/types/analytics.ts
export interface MLPredictions {
    riskScore: number;
    profitPotential: number;
    tradingStyle: string;
    recommendations: string[];
}

export interface MarketContext {
    globalVolume24h: number;
    topTokens: {
        symbol: string;
        price: number;
        volume24h: number;
        priceChange24h: number;
    }[];
    marketTrends: {
        shortTerm: 'bullish' | 'bearish' | 'neutral';
        longTerm: 'bullish' | 'bearish' | 'neutral';
    };
    dexMetrics: {
        name: string;
        volume24h: number;
        tvl: number;
    }[];
}

export interface TradingPattern {
    type: 'time' | 'volume' | 'token' | 'price';
    confidence: number;
    description: string;
    metrics: {
        [key: string]: number;
    };
    significance: 'high' | 'medium' | 'low';
}

export interface RiskProfile {
    volatility: number;
    drawdown: {
        max: number;
        current: number;
        duration: number;
    };
    concentration: {
        tokenLevel: number;
        protocolLevel: number;
    };
    correlation: {
        marketBeta: number;
        sectorCorrelations: {
            sector: string;
            correlation: number;
        }[];
    };
    var: {
        daily: number;
        weekly: number;
        confidence: number;
    };
    sharpeRatio: number;
    warnings: string[];
}

export interface DetailedMetrics {
    overview: {
        totalTransactions: number;
        uniqueTokens: number;
        totalVolume: number;
        totalFees: number;
        successRate: number;
        accountAge: number;
        lastActivity: number;
        profitLoss: {
            total: number;
            realized: number;
            unrealized: number;
        };
    };

    swapMetrics: {
        totalSwaps: number;
        swapVolume: number;
        averageSwapSize: number;
        dexDistribution: Array<{
            dex: string;
            volume: number;
            count: number;
            avgSlippage: number;
        }>;
        slippageStats: {
            average: number;
            median: number;
            max: number;
            min: number;
            standardDeviation: number;
        };
        timing: {
            bestHours: number[];
            worstHours: number[];
            weekdayDistribution: {
                day: string;
                volume: number;
                count: number;
            }[];
        };
    };

    tokenMetrics: Array<{
        symbol: string;
        mint: string;
        balance: number;
        volume24h: number;
        priceChange24h: number;
        transactions: number;
        lastActivity: number;
        profitLoss: number;
        holdingPeriod: number;
        riskScore: number;
    }>;

    tradingStats: {
        profitLoss: number;
        winRate: number;
        averageReturn: number;
        bestTrade: number;
        worstTrade: number;
        averageHoldTime: number;
        volatility: number;
        sharpeRatio: number;
        successiveWins: number;
        successiveLosses: number;
        tradingFrequency: Array<{
            date: string;
            count: number;
            volume: number;
            profitLoss: number;
        }>;
        patterns: TradingPattern[];
    };

    riskMetrics: RiskProfile & {
        liquidityExposure: number;
        impermanentLoss: {
            current: number;
            projected: number;
        };
        protocolExposure: {
            protocol: string;
            exposure: number;
            risk: 'high' | 'medium' | 'low';
        }[];
        marketBeta: number;
        composabilityRisk: number;
        smartContractRisk: {
            score: number;
            factors: string[];
        };
    };

    predictionMetrics: {
        priceTargets: {
            token: string;
            timeframe: '24h' | '7d' | '30d';
            prediction: number;
            confidence: number;
        }[];
        behaviorPredictions: {
            pattern: string;
            likelihood: number;
            impact: 'positive' | 'negative' | 'neutral';
        }[];
        riskPredictions: {
            scenario: string;
            probability: number;
            potentialImpact: number;
        }[];
    };

    aiInsights: {
        summary: string;
        tradingStyle: string;
        strengthsWeaknesses: {
            strengths: string[];
            weaknesses: string[];
        };
        opportunities: {
            description: string;
            confidence: number;
            timeframe: string;
        }[];
        recommendations: {
            type: 'risk' | 'performance' | 'strategy';
            description: string;
            priority: number;
            expectedImpact: string;
        }[];
        marketContext: {
            position: string;
            sentiment: string;
            keyFactors: string[];
        };
    };
}