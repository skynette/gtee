// src/lib/services/helius-service.ts
import { TransactionData, WalletData, TokenInfo } from '../types/transaction';

export class HeliusService {
    private apiKey: string;
    private baseUrl: string;

    constructor(apiKey: string) {
        this.apiKey = apiKey;
        this.baseUrl = 'https://api.helius.xyz/v0';
    }

    async getWalletTransactions(address: string, limit = 100): Promise<TransactionData[]> {
        try {
            // First get transaction signatures
            const signatures = await this.getTransactionSignatures(address, limit);

            // Then parse those transactions
            const transactions = await this.parseTransactions(signatures);

            return transactions;
        } catch (error) {
            console.error('Error fetching transactions:', error);
            throw error;
        }
    }

    private async getTransactionSignatures(address: string, limit: number): Promise<string[]> {
        const url = `${this.baseUrl}/addresses/${address}/transactions?api-key=${this.apiKey}&limit=${limit}`;

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return data.map((tx: any) => tx.signature);
        } catch (error) {
            console.error('Error fetching transaction signatures:', error);
            throw error;
        }
    }

    private async parseTransactions(signatures: string[]): Promise<TransactionData[]> {
        if (signatures.length === 0) return [];

        const url = `${this.baseUrl}/transactions?api-key=${this.apiKey}`;

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ transactions: signatures }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data.map(this.parseTransaction);
        } catch (error) {
            console.error('Error parsing transactions:', error);
            throw error;
        }
    }

    async getWalletBalances(address: string): Promise<WalletData> {
        const url = `${this.baseUrl}/addresses/${address}/balances?api-key=${this.apiKey}`;

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();

            return {
                balance: data.nativeBalance / 1e9, // Convert lamports to SOL
                tokenBalances: this.parseTokenBalances(data.tokens),
                transactions: [] // Will be populated separately
            };
        } catch (error) {
            console.error('Error fetching balances:', error);
            throw error;
        }
    }

    private parseTransaction(tx: any): TransactionData {
        let tokenInfo: TokenInfo | undefined;

        // Parse token info from swap events
        if (tx.events?.swap) {
            const swapEvent = tx.events.swap;
            const tokenInput = swapEvent.tokenInputs?.[0];
            const tokenOutput = swapEvent.tokenOutputs?.[0];

            if (tokenInput && tokenOutput) {
                tokenInfo = {
                    symbol: this.getTokenSymbol(tokenInput.mint),
                    mint: tokenInput.mint,
                    amount: Number(tokenInput.rawTokenAmount.tokenAmount) /
                        Math.pow(10, tokenInput.rawTokenAmount.decimals)
                };
            }
        }

        // Calculate the total amount from native transfers
        const amount = tx.nativeTransfers?.reduce((sum: number, transfer: any) =>
            sum + (Number(transfer.amount) / 1e9), 0) || 0;

        return {
            signature: tx.signature,
            timestamp: tx.timestamp,
            slot: tx.slot,
            type: tx.type,
            fee: tx.fee,
            feePayer: tx.feePayer,
            status: tx.transactionError ? 'error' : 'success',
            amount,
            tokenInfo,
            // Additional fields for analysis
            nativeTransfers: tx.nativeTransfers,
            tokenTransfers: tx.tokenTransfers,
            events: tx.events
        };
    }

    private parseTokenBalances(tokens: any[]): Record<string, number> {
        return tokens?.reduce((acc, token) => {
            acc[token.mint] = token.amount / Math.pow(10, token.decimals);
            return acc;
        }, {} as Record<string, number>) || {};
    }

    // Helper function to get token symbol - in real implementation,
    // this would use a token registry or cache
    private getTokenSymbol(mint: string): string {
        // You would implement token symbol lookup here
        // For now, return shortened mint as symbol
        return mint.slice(0, 6);
    }

    // Method to parse token amounts with proper decimals
    private parseTokenAmount(rawAmount: string, decimals: number): number {
        return Number(rawAmount) / Math.pow(10, decimals);
    }
}