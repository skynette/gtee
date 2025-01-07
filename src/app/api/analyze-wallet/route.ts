// src/app/api/analyze-wallet/route.ts
import { NextResponse } from 'next/server';
import { AdvancedWalletAnalyzer } from '@/lib/analysis/wallet-analyzer';
import { ANALYSIS_CONFIG } from '@/config/analysis-config';

const DEFAULT_MARKET_DATA = {
    globalVolume24h: 0,
    topTokens: [],
    marketTrends: {
        shortTerm: 'neutral' as const,
        longTerm: 'neutral' as const
    },
    dexMetrics: []
};

const TIMEOUT = 45000; // Increased to 45 seconds to account for retries

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');

    if (!address) {
        return NextResponse.json(
            { error: 'Wallet address is required' },
            { status: 400 }
        );
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);

    try {
        const apiKey = process.env.NEXT_PUBLIC_HELIUS_API_KEY;
        if (!apiKey) {
            throw new Error('Helius API key is not configured');
        }

        const analyzer = new AdvancedWalletAnalyzer(
            apiKey,
            'https://api.mainnet-beta.solana.com',
            {
                retryDelay: 1000,
                maxRetries: 3,
                chunkSize: 50, // Reduce chunk size for better rate limit handling
            },
            DEFAULT_MARKET_DATA
        );

        const metrics = await analyzer.analyzeWallet(address);
        clearTimeout(timeoutId);

        if (!metrics) {
            return NextResponse.json(
                { error: 'No data available for this wallet' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            metrics,
            timestamp: Date.now(),
            status: 'success'
        });
    } catch (error: any) {
        clearTimeout(timeoutId);
        console.error('Analysis error:', error);

        // Handle specific error cases
        if (error.name === 'AbortError') {
            return NextResponse.json(
                { error: 'Request timeout' },
                { status: 504 }
            );
        }

        if (error.message.includes('Rate limit')) {
            return NextResponse.json(
                {
                    error: 'Service temporarily unavailable',
                    details: 'Rate limit exceeded. Please try again later.'
                },
                { status: 429 }
            );
        }

        if (error.message.includes('API key')) {
            return NextResponse.json(
                { error: 'API configuration error' },
                { status: 503 }
            );
        }

        // Generic error response
        return NextResponse.json(
            {
                error: 'Failed to analyze wallet',
                details: error.message
            },
            { status: 500 }
        );
    }
}

// Route configuration
export const runtime = 'edge';
export const dynamic = 'force-dynamic';
export const revalidate = 0;