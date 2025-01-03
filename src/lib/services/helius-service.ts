// src/lib/services/helius-service.ts
import { TransactionData, WalletData, TokenInfo } from '../types/transaction';

export class HeliusService {
    private apiKey: string;
    private baseUrl: string;
    private rpcUrl: string;

    constructor(apiKey: string) {
        this.apiKey = apiKey;
        this.baseUrl = 'https://api.helius.xyz/v0';
        this.rpcUrl = 'https://mainnet.helius-rpc.com';
    }

    async getWalletTransactions(address: string, limit = 100): Promise<TransactionData[]> {
        try {
            // First get transaction signatures using RPC endpoint
            const signatures = await this.getTransactionSignatures(address, limit);

            // Then parse those transactions if we have signatures
            if (signatures.length > 0) {
                const transactions = await this.parseTransactions(signatures);
                return transactions;
            }

            return [];
        } catch (error) {
            console.error('Error fetching transactions:', error);
            // Rethrow with more context
            if (error instanceof Error) {
                throw new Error(`Failed to fetch wallet transactions: ${error.message}`);
            } else {
                throw new Error('Failed to fetch wallet transactions: Unknown error');
            }
        }
    }

    private async getTransactionSignatures(address: string, limit: number): Promise<string[]> {
        const rpcBody = {
            jsonrpc: "2.0",
            id: "1",
            method: "getSignaturesForAddress",
            params: [
                address,
                {
                    limit,
                    commitment: "confirmed"
                }
            ]
        };

        try {
            const response = await fetch(`${this.rpcUrl}/?api-key=${this.apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(rpcBody),
                next: { revalidate: 0 },
            });

            if (!response.ok) {
                if (response.status === 429) {
                    throw new Error('Rate limit exceeded. Please try again later.');
                }
                throw new Error(`RPC request failed: ${response.status}`);
            }

            const data = await response.json();

            if (data.error) {
                throw new Error(`RPC error: ${data.error.message}`);
            }

            // Extract signatures from the result
            return data.result.map((item: any) => item.signature);
        } catch (error) {
            console.error('Error fetching transaction signatures:', error);
            // Add retry logic for rate limiting
            if (error instanceof Error && error.message.includes('Rate limit')) {
                await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
                return this.getTransactionSignatures(address, limit); // Retry once
            }
            throw error;
        }
    }

    private async parseTransactions(signatures: string[]): Promise<TransactionData[]> {
        if (signatures.length === 0) return [];

        const url = `${this.baseUrl}/transactions?api-key=${this.apiKey}`;

        try {
            // Split signatures into chunks of 100 to avoid API limits
            const chunkSize = 100;
            const chunks = [];
            for (let i = 0; i < signatures.length; i += chunkSize) {
                chunks.push(signatures.slice(i, i + chunkSize));
            }

            const allTransactions: TransactionData[] = [];

            // Process each chunk with delay to avoid rate limiting
            for (const chunk of chunks) {
                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ transactions: chunk }),
                });

                if (!response.ok) {
                    if (response.status === 429) {
                        // Wait and retry for rate limiting
                        await new Promise(resolve => setTimeout(resolve, 1000));
                        continue;
                    }
                    throw new Error(`Parse transaction failed: ${response.status}`);
                }

                const data = await response.json();
                allTransactions.push(...data.map(this.parseTransaction));

                // Add small delay between chunks
                if (chunks.length > 1) {
                    await new Promise(resolve => setTimeout(resolve, 200));
                }
            }

            return allTransactions;
        } catch (error) {
            console.error('Error parsing transactions:', error);
            throw error;
        }
    }

    async getWalletBalances(address: string): Promise<WalletData> {
        const url = `${this.baseUrl}/addresses/${address}/balances?api-key=${this.apiKey}`;

        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                next: { revalidate: 0 },
                cache: 'no-store',
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();

            return {
                balance: data.nativeBalance / 1e9,
                tokenBalances: this.parseTokenBalances(data.tokens),
                transactions: []
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