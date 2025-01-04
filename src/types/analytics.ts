// types/analytics.ts

export interface TokenHolding {
    symbol: string;
    name: string;
    balance: number;
    value: number;
    price: number;
    change24h: number;
    logoUrl?: string;
}

export interface Transaction {
    hash: string;
    type: 'SWAP' | 'TRANSFER' | 'STAKE' | 'UNSTAKE' | 'OTHER';
    timestamp: number;
    value: number;
    success: boolean;
    protocol?: string;
    details: {
        tokenIn?: string;
        tokenOut?: string;
        amountIn?: number;
        amountOut?: number;
        slippage?: number;
    };
}

export interface DeFiPosition {
    protocol: string;
    type: 'LENDING' | 'LIQUIDITY' | 'STAKING';
    asset: string;
    amount: number;
    value: number;
    apy: number;
    risk: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface ProtocolInteraction {
    protocol: string;
    totalInteractions: number;
    lastInteraction: number;
    totalVolume: number;
    successRate: number;
}

export interface AIInsight {
    type: 'OPPORTUNITY' | 'RISK' | 'PATTERN' | 'RECOMMENDATION';
    title: string;
    description: string;
    confidence: number;
    impact: 'LOW' | 'MEDIUM' | 'HIGH';
    action?: string;
}

export interface WalletMetrics {
    address: string;
    accountAge: number;
    totalValue: number;
    valueChange24h: number;
    riskScore: number;
    performanceMetrics: {
        dailyReturn: number;
        weeklyReturn: number;
        monthlyReturn: number;
        sharpeRatio: number;
        winRate: number;
    };
    holdings: TokenHolding[];
    transactions: Transaction[];
    defiPositions: DeFiPosition[];
    protocolInteractions: ProtocolInteraction[];
    aiInsights: AIInsight[];
}