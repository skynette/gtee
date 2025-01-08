// app/api/analyze/route.ts
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

export interface AnalysisResponse {
    patterns: string[];
    majorIssues: string[];
    recommendations: string[];
    riskScore: number;
}

export interface TransactionData {
    time: string;
    amount: number;
    status: 'Success' | 'Failed';
}

import type { ChatCompletionCreateParamsBase } from 'openai/resources/chat/completions';

export type AnalysisRequest = ChatCompletionCreateParamsBase;

export async function POST(request: Request) {
    try {
        const body: AnalysisRequest = await request.json();

        const completion = await openai.chat.completions.create({
            model: body.model,
            messages: body.messages,
            temperature: body.temperature,
            response_format: body.response_format
        });

        return NextResponse.json(completion);
    } catch (error: any) {
        console.error('OpenAI API error:', error);
        return NextResponse.json(
            {
                message: 'Error analyzing transactions',
                error: error.message
            },
            { status: 500 }
        );
    }
}