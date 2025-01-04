// app/api/generate-insights/route.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import { AIInsight } from '@/types/analytics';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY!;
const generativeAI = new GoogleGenerativeAI(GEMINI_API_KEY);

export async function POST(request: Request) {
    try {
        const { prompt, metrics } = await request.json();

        const model = generativeAI.getGenerativeModel({
            model: "gemini-1.5-pro",
        });

        // Generate different types of insights
        const [portfolio, risk, pattern, opportunities] = await Promise.all([
            generatePortfolioInsights(model, metrics),
            generateRiskInsights(model, metrics),
            generatePatternInsights(model, metrics),
            generateOpportunityInsights(model, metrics)
        ]);

        const insights: AIInsight[] = [
            ...portfolio,
            ...risk,
            ...pattern,
            ...opportunities
        ];

        return Response.json({ insights });
    } catch (error) {
        console.error('Error generating insights:', error);
        return Response.json({ error: 'Failed to generate insights' }, { status: 500 });
    }
}

async function generatePortfolioInsights(model: any, metrics: any): Promise<AIInsight[]> {
    const prompt = `Analyze this cryptocurrency portfolio and provide key insights:
    Total Value: $${metrics.totalValue}
    Holdings: ${JSON.stringify(metrics.holdings)}
    Performance: ${JSON.stringify(metrics.performanceMetrics)}
    
    Focus on:
    1. Portfolio composition and diversification
    2. Performance analysis
    3. Key strengths and weaknesses
    
    Provide 2-3 specific, actionable insights.`;

    const result = await model.generateContent(prompt);
    const text = await result.response.text();

    return parseInsights(text, 'PATTERN');
}

async function generateRiskInsights(model: any, metrics: any): Promise<AIInsight[]> {
    const prompt = `Analyze the risk factors in this cryptocurrency portfolio:
    Risk Score: ${metrics.riskScore}
    Holdings: ${JSON.stringify(metrics.holdings)}
    DeFi Positions: ${JSON.stringify(metrics.defiPositions)}
    
    Focus on:
    1. Concentration risk
    2. Protocol exposure
    3. Market volatility exposure
    
    Provide 2-3 specific risk warnings or recommendations.`;

    const result = await model.generateContent(prompt);
    const text = await result.response.text();

    return parseInsights(text, 'RISK');
}

async function generatePatternInsights(model: any, metrics: any): Promise<AIInsight[]> {
    const prompt = `Analyze trading patterns in this wallet:
    Transactions: ${JSON.stringify(metrics.transactions)}
    Performance: ${JSON.stringify(metrics.performanceMetrics)}
    
    Focus on:
    1. Trading frequency and timing
    2. Success patterns
    3. Common mistakes or inefficiencies
    
    Identify 2-3 key patterns or behaviors.`;

    const result = await model.generateContent(prompt);
    const text = await result.response.text();

    return parseInsights(text, 'PATTERN');
}

async function generateOpportunityInsights(model: any, metrics: any): Promise<AIInsight[]> {
    const prompt = `Identify potential opportunities for this cryptocurrency portfolio:
    Current Holdings: ${JSON.stringify(metrics.holdings)}
    DeFi Positions: ${JSON.stringify(metrics.defiPositions)}
    Risk Score: ${metrics.riskScore}
    
    Focus on:
    1. Yield opportunities
    2. Portfolio optimization
    3. Risk-adjusted improvements
    
    Suggest 2-3 specific opportunities or improvements.`;

    const result = await model.generateContent(prompt);
    const text = await result.response.text();

    return parseInsights(text, 'OPPORTUNITY');
}

function parseInsights(text: string, type: AIInsight['type']): AIInsight[] {
    // Split text into separate insights and structure them
    const insights = text.split('\n\n').filter(Boolean).map(insight => {
        const lines = insight.split('\n');
        return {
            type,
            title: lines[0],
            description: lines.slice(1).join(' '),
            confidence: calculateConfidence(insight),
            impact: determineImpact(insight),
            action: extractAction(insight)
        };
    });

    return insights;
}

function calculateConfidence(text: string): number {
    // Simple confidence calculation based on language certainty
    const certainWords = ['definitely', 'clearly', 'shows', 'demonstrates'];
    const uncertainWords = ['might', 'could', 'maybe', 'possibly'];

    const certainCount = certainWords.filter(word => text.toLowerCase().includes(word)).length;
    const uncertainCount = uncertainWords.filter(word => text.toLowerCase().includes(word)).length;

    return Math.min(1, Math.max(0, 0.7 + (certainCount * 0.1) - (uncertainCount * 0.1)));
}

function determineImpact(text: string): 'LOW' | 'MEDIUM' | 'HIGH' {
    const impactWords = {
        high: ['significant', 'critical', 'important', 'major', 'substantial'],
        medium: ['moderate', 'reasonable', 'average'],
        low: ['minor', 'small', 'minimal', 'slight']
    };

    const counts = {
        high: impactWords.high.filter(word => text.toLowerCase().includes(word)).length,
        medium: impactWords.medium.filter(word => text.toLowerCase().includes(word)).length,
        low: impactWords.low.filter(word => text.toLowerCase().includes(word)).length
    };

    const max = Math.max(counts.high, counts.medium, counts.low);
    if (counts.high === max) return 'HIGH';
    if (counts.medium === max) return 'MEDIUM';
    return 'LOW';
}

function extractAction(text: string): string | undefined {
    // Look for action-oriented statements
    const actionPhrases = [
        'should consider',
        'recommend',
        'could benefit from',
        'advise',
        'suggest',
        'need to',
        'must',
        'consider'
    ];

    for (const phrase of actionPhrases) {
        const index = text.toLowerCase().indexOf(phrase);
        if (index !== -1) {
            // Extract the sentence containing the action phrase
            const start = text.lastIndexOf('.', index) + 1;
            const end = text.indexOf('.', index);
            if (end === -1) {
                return text.slice(start).trim();
            }
            return text.slice(start, end).trim();
        }
    }

    return undefined;
}