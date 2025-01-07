// src/lib/services/helius-service.ts
import { 
    TransactionData, 
    WalletData, 
    TokenInfo, 
    TokenBalance,
    ParsedTransaction,
    NativeTransfer,
    TokenTransfer
} from '../types/transaction';

interface TokenMetadata {
    symbol: string;
    name: string;
    decimals: number;
    logoURI?: string;
}

export class HeliusService {
    private apiKey: string;
    private baseUrl: string;
    private rpcUrl: string;
    private tokenMetadataCache: Map<string, TokenMetadata>;

    constructor(apiKey: string) {
        this.apiKey = apiKey;
        this.baseUrl = 'https://api.helius.xyz/v0';
        this.rpcUrl = 'https://mainnet.helius-rpc.com';
        this.tokenMetadataCache = new Map();
    }

    async getWalletTransactions(address: string, limit = 100, beforeSignature?: string): Promise<TransactionData[]> {
        try {
            const signatures = await this.getTransactionSignatures(address, limit, beforeSignature);
            
            if (signatures.length > 0) {
                const transactions = await this.parseTransactions(signatures);
                return transactions;
            }
            return [];
        } catch (error) {
            console.error('Error fetching transactions:', error);
            if (error instanceof Error) {
                throw new Error(`Failed to fetch wallet transactions: ${error.message}`);
            }
            throw new Error('Failed to fetch wallet transactions: Unknown error');
        }
    }

    async getWalletBalances(address: string): Promise<WalletData> {
        const url = `${this.baseUrl}/addresses/${address}/balances?api-key=${this.apiKey}`;

        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                next: { revalidate: 0 },
                cache: 'no-store',
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            // Fetch token metadata for all tokens in parallel
            const tokenPromises = data.tokens.map(async (token: TokenBalance) => {
                const metadata = await this.getTokenMetadata(token.mint);
                return {
                    ...token,
                    metadata
                };
            });

            const tokensWithMetadata = await Promise.all(tokenPromises);

            return {
                balance: data.nativeBalance / 1e9,
                tokenBalances: this.parseTokenBalancesWithMetadata(tokensWithMetadata),
                transactions: []
            };
        } catch (error) {
            console.error('Error fetching balances:', error);
            throw error;
        }
    }

    private async getTransactionSignatures(
        address: string, 
        limit: number,
        beforeSignature?: string
    ): Promise<string[]> {
        const params: any[] = [
            address,
            {
                limit,
                commitment: "finalized",
            }
        ];

        if (beforeSignature) {
            params[1].before = beforeSignature;
        }

        // Generate random 8 digit number for request ID
        const requestId = Math.floor(10000000 + Math.random() * 90000000);
        
        const rpcBody = {
            jsonrpc: "2.0",
            id: requestId.toString(),
            method: "getSignaturesForAddress",
            params
        };

        try {
            const response = await fetch(`${this.rpcUrl}/?api-key=${this.apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(rpcBody),
            });

            if (!response.ok) {
                if (response.status === 429) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    return this.getTransactionSignatures(address, limit, beforeSignature);
                }
                throw new Error(`RPC request failed: ${response.status}`);
            }

            const data = await response.json();
            if (data.error) {
                throw new Error(`RPC error: ${data.error.message}`);
            }

            return data.result.map((item: any) => item.signature);
        } catch (error) {
            console.error('Error fetching transaction signatures:', error);
            throw error;
        }
    }

    private async parseTransactions(signatures: string[]): Promise<TransactionData[]> {

        console.log('Parsing transactions:', signatures);
        if (signatures.length === 0) return [];

        const url = `${this.baseUrl}/transactions?api-key=${this.apiKey}`;
        const chunkSize = 100;
        const chunks = [];

        for (let i = 0; i < signatures.length; i += chunkSize) {
            chunks.push(signatures.slice(i, i + chunkSize));
        }

        try {
            const allTransactions: TransactionData[] = [];

            for (const chunk of chunks) {
                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.apiKey}`
                    },
                    body: JSON.stringify({ transactions: chunk }),
                    cache: 'no-store'
                });

                if (!response.ok) {
                    if (response.status === 429) {
                        await new Promise(resolve => setTimeout(resolve, 1000));
                        continue;
                    }
                    throw new Error(`Parse transaction failed: ${response.status}`);
                }

                console.log('Parsing transactions:', chunk);

                const parsedTxs: ParsedTransaction[] = await response.json();
                const txsWithTokenInfo = await Promise.all(
                    parsedTxs.map(async tx => this.parseTransaction(tx))
                );
                allTransactions.push(...txsWithTokenInfo);

                if (chunks.length > 1) {
                    await new Promise(resolve => setTimeout(resolve, 200));
                }
            }

            console.log('Parsed transactions:', allTransactions);

            return allTransactions;
        } catch (error) {
            console.error('Error parsing transactions:', error);
            throw error;
        }
    }

    private async parseTransaction(tx: ParsedTransaction): Promise<TransactionData> {
        let tokenInfo: TokenInfo | undefined;

        // Parse token transfers
        if (tx.tokenTransfers?.length > 0) {
            const transfer = tx.tokenTransfers[0];
            const metadata = await this.getTokenMetadata(transfer.mint);
            
            tokenInfo = {
                symbol: metadata?.symbol || 'Unknown',
                name: metadata?.name || 'Unknown Token',
                mint: transfer.mint,
                amount: this.parseTokenAmount(transfer.tokenAmount.toString(), metadata?.decimals || 0),
                decimals: metadata?.decimals || 0
            };
        }

        // Parse swap events
        if (!tokenInfo && tx.events?.swap) {
            const swapEvent = tx.events.swap;
            const tokenInput = swapEvent.tokenInputs?.[0];
            
            if (tokenInput) {
                const metadata = await this.getTokenMetadata(tokenInput.mint);
                tokenInfo = {
                    symbol: metadata?.symbol || 'Unknown',
                    name: metadata?.name || 'Unknown Token',
                    mint: tokenInput.mint,
                    amount: this.parseTokenAmount(
                        tokenInput.rawTokenAmount.tokenAmount,
                        tokenInput.rawTokenAmount.decimals
                    ),
                    decimals: metadata?.decimals || 0
                };
            }
        }

        const amount = tx.nativeTransfers?.reduce((sum: number, transfer: NativeTransfer) =>
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
            nativeTransfers: tx.nativeTransfers,
            tokenTransfers: tx.tokenTransfers,
            events: tx.events,
            description: tx.description
        };
    }

    private async getTokenMetadata(mint: string): Promise<TokenMetadata | undefined> {
        if (this.tokenMetadataCache.has(mint)) {
            return this.tokenMetadataCache.get(mint);
        }

        try {
            const response = await fetch(
                `${this.baseUrl}/token-metadata?api-key=${this.apiKey}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ mintAccounts: [mint] })
                }
            );

            if (!response.ok) return undefined;

            const data = await response.json();
            if (data?.[0]) {
                const metadata: TokenMetadata = {
                    symbol: data[0].symbol,
                    name: data[0].name,
                    decimals: data[0].decimals,
                    logoURI: data[0].logoURI
                };
                this.tokenMetadataCache.set(mint, metadata);
                return metadata;
            }
        } catch (error) {
            console.error(`Error fetching metadata for token ${mint}:`, error);
        }
        return undefined;
    }

    private parseTokenBalancesWithMetadata(tokens: any[]): Record<string, TokenInfo> {
        return tokens.reduce((acc, token) => {
            acc[token.mint] = {
                symbol: token.metadata?.symbol || 'Unknown',
                name: token.metadata?.name || 'Unknown Token',
                mint: token.mint,
                amount: token.amount / Math.pow(10, token.decimals),
                decimals: token.decimals
            };
            return acc;
        }, {} as Record<string, TokenInfo>);
    }

    private parseTokenAmount(rawAmount: string, decimals: number): number {
        return Number(rawAmount) / Math.pow(10, decimals);
    }
}