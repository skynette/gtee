// src/app/api/analyze-wallet/route.ts
import { NextResponse } from 'next/server';
import { AdvancedWalletAnalyzer } from '@/lib/analysis/wallet-analyzer';
import { ANALYSIS_CONFIG } from '@/config/analysis-config';

const DEFAULT_MARKET_DATA = {
    globalVolume24h: 0,
    topTokens: [],
    marketTrends: {
        shortTerm: 'neutral',
        longTerm: 'neutral'
    },
    dexMetrics: []
};

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');

    if (!address) {
        return NextResponse.json(
            { error: 'Wallet address is required' },
            { status: 400 }
        );
    }

    try {
        // Create analyzer with minimal config
        const analyzer = new AdvancedWalletAnalyzer(
            process.env.NEXT_PUBLIC_HELIUS_API_KEY!,
            'https://api.mainnet-beta.solana.com',
            {}, // Empty config object instead of ML config
            DEFAULT_MARKET_DATA
        );

        const metrics = await analyzer.analyzeWallet(address);
        return NextResponse.json({ metrics });
    } catch (error) {
        console.error('Analysis error:', error);
        return NextResponse.json(
            { error: 'Failed to analyze wallet' },
            { status: 500 }
        );
    }
}