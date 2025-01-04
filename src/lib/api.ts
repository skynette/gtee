// lib/api.ts
import { PublicKey, PublicKeyInitData } from "@solana/web3.js";
import type { WalletMetrics, TokenHolding, Transaction, DeFiPosition, ProtocolInteraction } from '../types/analytics';

interface QuickNodeTransaction {
    signature: string;
    blockTime: number;
    value: number;
    success: boolean;
    type?: string;
    protocol?: string;
    [key: string]: any;
}

interface QuickNodeToken {
    mint: PublicKeyInitData;
    balance: number;
    value: number;
    price: number;
    priceChange24h: number;
}

interface QuickNodeResponse {
    tokens: QuickNodeToken[];
    transactions: QuickNodeTransaction[];
    protocolInteractions?: any[];
}

const QUICKNODE_API_KEY = process.env.NEXT_PUBLIC_QUICKNODE_API_KEY;

export async function fetchWalletData(address: string): Promise<WalletMetrics> {
    try {
        // QuickNode API call
        const data = {
            network: "solana-mainnet",
            address: address,
            endpoints: [
                "token_balances",
                "transaction_history",
                "protocol_interactions"
            ]
        };

        const headers: HeadersInit = {
            "Content-Type": "application/json",
            "x-api-key": QUICKNODE_API_KEY || ""
        };

        const res = await fetch(
            `https://api.quicknode.com/qn-api/v1/wallet/${address}`,
            {
                method: "POST",
                headers,
                body: JSON.stringify(data)
            }
        );

        if (!res.ok) {
            throw new Error(`QuickNode API error: ${res.status}`);
        }

        const qnData: QuickNodeResponse = await res.json();

        // Process token holdings
        const tokenHoldings: TokenHolding[] = await Promise.all(
            (qnData.tokens || []).map(async (token: QuickNodeToken) => {
                const mint = new PublicKey(token.mint);
                // Since we removed the UTL SDK dependency, we'll use a simpler token info approach
                // You might want to implement your own token info fetching logic here
                return {
                    symbol: "Unknown",
                    name: "Unknown Token",
                    balance: token.balance,
                    value: token.value,
                    price: token.price,
                    change24h: token.priceChange24h,
                    logoUrl: undefined
                };
            })
        );

        // Process transactions
        const transactions: Transaction[] = (qnData.transactions || []).map((tx: QuickNodeTransaction) => ({
            hash: tx.signature,
            type: determineTransactionType(tx),
            timestamp: tx.blockTime,
            value: tx.value,
            success: tx.success,
            protocol: identifyProtocol(tx),
            details: extractTransactionDetails(tx)
        }));

        // Fetch DeFi positions
        const defiPositions = await fetchDefiPositions(address);

        // Process protocol interactions
        const protocolInteractions: ProtocolInteraction[] = processProtocolInteractions(qnData.protocolInteractions);

        // Calculate metrics
        const metrics = calculateMetrics(tokenHoldings, transactions, defiPositions);

        // Get AI insights
        const aiInsights = await getAIInsights({
            ...metrics,
            holdings: tokenHoldings,
            transactions,
            defiPositions,
            protocolInteractions
        });

        return {
            address,
            ...metrics,
            holdings: tokenHoldings,
            transactions,
            defiPositions,
            protocolInteractions,
            aiInsights
        };

    } catch (error) {
        console.error("Error fetching wallet data:", error);
        throw error;
    }
}

function processProtocolInteractions(interactions: any[] = []): ProtocolInteraction[] {
    return interactions.map(interaction => ({
        protocol: interaction.protocol || "Unknown",
        totalInteractions: interaction.count || 0,
        lastInteraction: interaction.lastTimestamp || Date.now(),
        totalVolume: interaction.volume || 0,
        successRate: interaction.successRate || 0
    }));
}

async function fetchDefiPositions(address: string): Promise<DeFiPosition[]> {
    // Implementation to fetch DeFi positions from various protocols
    return [];
}

function calculateMetrics(
    holdings: TokenHolding[],
    transactions: Transaction[],
    defiPositions: DeFiPosition[]
) {
    return {
        accountAge: calculateAccountAge(transactions),
        totalValue: calculateTotalValue(holdings, defiPositions),
        valueChange24h: calculateValueChange(holdings),
        riskScore: calculateRiskScore(holdings, transactions, defiPositions),
        performanceMetrics: calculatePerformanceMetrics(transactions)
    };
}

async function getAIInsights(metrics: Partial<WalletMetrics>) {
    try {
        const response = await fetch('/api/generate-insights', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ metrics })
        });

        if (!response.ok) {
            throw new Error('Failed to generate insights');
        }

        const { insights } = await response.json();
        return insights;
    } catch (error) {
        console.error("Error generating AI insights:", error);
        return [];
    }
}

function determineTransactionType(tx: QuickNodeTransaction): Transaction['type'] {
    // Add logic to determine transaction type based on tx data
    return 'OTHER';
}

function identifyProtocol(tx: QuickNodeTransaction): string | undefined {
    // Add logic to identify protocol from transaction data
    return tx.protocol;
}

function extractTransactionDetails(tx: QuickNodeTransaction) {
    return {
        tokenIn: tx.tokenIn,
        tokenOut: tx.tokenOut,
        amountIn: tx.amountIn,
        amountOut: tx.amountOut,
        slippage: tx.slippage
    };
}

function calculateAccountAge(transactions: Transaction[]): number {
    if (!transactions.length) return 0;
    const firstTx = Math.min(...transactions.map(tx => tx.timestamp));
    return Math.floor((Date.now() / 1000 - firstTx) / (24 * 60 * 60));
}

function calculateTotalValue(holdings: TokenHolding[], defiPositions: DeFiPosition[]): number {
    const holdingsValue = holdings.reduce((sum, token) => sum + token.value, 0);
    const defiValue = defiPositions.reduce((sum, pos) => sum + pos.value, 0);
    return holdingsValue + defiValue;
}

function calculateValueChange(holdings: TokenHolding[]): number {
    const totalValue = holdings.reduce((sum, token) => sum + token.value, 0);
    const weightedChange = holdings.reduce((sum, token) => {
        const weight = token.value / totalValue;
        return sum + (token.change24h * weight);
    }, 0);
    return weightedChange;
}

function calculateRiskScore(
    holdings: TokenHolding[],
    transactions: Transaction[],
    defiPositions: DeFiPosition[]
): number {
    // Add your risk score calculation logic here
    return Math.floor(Math.random() * 100); // Placeholder implementation
}

function calculatePerformanceMetrics(transactions: Transaction[]) {
    // Add your performance metrics calculation logic here
    return {
        dailyReturn: 0,
        weeklyReturn: 0,
        monthlyReturn: 0,
        sharpeRatio: 0,
        winRate: 0
    };
}