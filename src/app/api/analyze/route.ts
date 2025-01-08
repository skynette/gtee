// app/api/analyze/route.ts
import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export interface AnalysisResponse {
    portfolioOverview: string;
    tradingBehavior: string;
    riskProfile: string;
    marketEngagement: string;
    recommendations: string;
}

export async function POST(request: Request) {
    try {
        const { transactions, tokens, address } = await request.json();

        // Format transaction data for analysis
        const formattedData = {
            totalTransactions: transactions.length,
            timeSpan: transactions.length > 0
                ? Math.ceil((Date.now() / 1000 - transactions[0].blockTime) / (24 * 60 * 60))
                : 0,
            transactionVolumes: transactions.map((tx: { meta: { preBalances: any[]; postBalances: any[]; }; }) => {
                const preBalance = tx.meta.preBalances[0];
                const postBalance = tx.meta.postBalances[0];
                return Math.abs(postBalance - preBalance) / 1e9; // Convert to SOL
            }),
            uniqueTokens: new Set(tokens.map((token: any) => token.mint)).size,
            tradingTimes: transactions.map((tx: { blockTime: number; }) =>
                new Date(tx.blockTime * 1000).getUTCHours()
            ),
            tokens: tokens.map((token: any) => ({
                mint: token.mint,
                amount: token.amount,
            }))
        };

        // Create Gemini model instance
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        // Construct prompt for analysis
        const prompt = `Analyze this Solana wallet's trading behavior and provide insights:
        
        Wallet Data:
        - Total Transactions: ${formattedData.totalTransactions}
        - Time Period: ${formattedData.timeSpan} days
        - Average Transaction Volume: ${formattedData.transactionVolumes.reduce((a: any, b: any) => a + b, 0) / formattedData.transactionVolumes.length
            } SOL
        - Unique Tokens: ${formattedData.uniqueTokens}
        
        Provide a detailed analysis covering:
        1. Portfolio Overview: Analyze portfolio composition and transaction patterns
        2. Trading Behavior: Examine trading frequency, timing, and volume patterns
        3. Risk Profile: Evaluate risk management and strategy based on data
        4. Market Engagement: Assess level of participation in Solana ecosystem
        5. Strategic Recommendations: Provide specific, actionable recommendations
        
        Format the response as JSON with these exact keys:
        {
            "portfolioOverview": "detailed text",
            "tradingBehavior": "detailed text",
            "riskProfile": "detailed text",
            "marketEngagement": "detailed text",
            "recommendations": "detailed text"
        }`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const analysisText = response.text();

        // Parse the JSON response
        const analysis = JSON.parse(analysisText);

        return NextResponse.json(analysis);
    } catch (error: any) {
        console.error('Gemini API error:', error);
        return NextResponse.json(
            {
                message: 'Error analyzing transactions',
                error: error.message
            },
            { status: 500 }
        );
    }
}