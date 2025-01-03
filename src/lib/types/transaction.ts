// src/lib/types/transaction.ts
export interface TokenInfo {
    symbol: string;
    mint: string;
    amount: number;
}

export interface NativeTransfer {
    fromUserAccount: string;
    toUserAccount: string;
    amount: number;
}

export interface TokenTransfer {
    fromUserAccount: string;
    toUserAccount: string;
    fromTokenAccount: string;
    toTokenAccount: string;
    tokenAmount: number;
    mint: string;
}

export interface TransactionData {
    signature: string;
    timestamp: number;
    slot: number;
    type: string;
    fee: number;
    feePayer: string;
    status: 'success' | 'error';
    amount?: number;
    tokenInfo?: TokenInfo;
    // Additional fields for analysis
    nativeTransfers?: NativeTransfer[];
    tokenTransfers?: TokenTransfer[];
    events?: {
        swap?: any;
        nft?: any;
    };
}

export interface WalletData {
    balance: number;
    transactions: TransactionData[];
    tokenBalances: Record<string, number>;
}

export interface TokenBalance {
    mint: string;
    amount: number;
    decimals: number;
}

export interface ParsedTransaction {
    description: string;
    type: string;
    source: string;
    fee: number;
    feePayer: string;
    signature: string;
    slot: number;
    timestamp: number;
    nativeTransfers: NativeTransfer[];
    tokenTransfers: TokenTransfer[];
    accountData: any[];
    transactionError?: any;
    events?: {
        swap?: {
            nativeInput?: { account: string; amount: string; };
            nativeOutput?: { account: string; amount: string; };
            tokenInputs?: any[];
            tokenOutputs?: any[];
            tokenFees?: any[];
            nativeFees?: any[];
            innerSwaps?: any[];
        };
        nft?: {
            type: string;
            amount: number;
            fee: number;
            feePayer: string;
            signature: string;
            slot: number;
            timestamp: number;
            saleType?: string;
            buyer?: string;
            seller?: string;
            nfts?: Array<{
                mint: string;
                tokenStandard: string;
            }>;
        };
    };
}