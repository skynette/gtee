import OpenAI from 'openai';
import { AnalysisResponse, TransformedData } from '../types/types';


export class TradingAnalyzer {
    private openai: OpenAI;

    constructor(apiKey: string) {
        this.openai = new OpenAI({
            apiKey: apiKey
        });
    }

    public async analyzeTrading(tradingData: TransformedData): Promise<AnalysisResponse> {
        try {
            console.log("[*] analyzing with AI")
            const response = await this.openai.chat.completions.create({
                model: "gpt-4o",
                messages: [
                    {
                        role: "system",
                        content: "You are a professional trading analyst. Analyze the provided trading data and provide actionable insights. Return ONLY the JSON response without any markdown formatting or additional text."
                    },
                    {
                        role: "user",
                        content: this.generatePrompt(tradingData)
                    }
                ],
                temperature: 0.7,
                max_tokens: 2000
            });

            console.log("[+] response", response);
            const analysisText = response.choices[0]?.message?.content || '';
            console.log("[+] analysis text", analysisText);

            try {
                // Clean the response text before parsing
                const cleanedText = this.cleanResponseText(analysisText);
                const parsedAnalysis = JSON.parse(cleanedText) as AnalysisResponse;
                return this.validateAndCleanAnalysis(parsedAnalysis);
            } catch (parseError) {
                console.error('Error parsing OpenAI response:', parseError);
                console.error('Raw text:', analysisText);
                throw new Error('Failed to parse analysis response');
            }
        } catch (error) {
            console.error('Error calling OpenAI API:', error);
            throw new Error('Failed to generate trading analysis');
        }
    }

    private cleanResponseText(text: string): string {
        // Remove markdown code block indicators and any surrounding whitespace
        return text
            .replace(/^```json\s*/g, '')  // Remove opening ```json
            .replace(/\s*```\s*$/g, '')   // Remove closing ```
            .replace(/^```\s*/g, '')      // Remove any other markdown indicators
            .trim();
    }

    private generatePrompt(data: TransformedData): string {
        return `
        Please analyze the following trading data and provide detailed insights:
    
        Trading Data:
        ${JSON.stringify(data, null, 2)}
    
        Please analyze this data and provide:
    
        1. Overall Performance Analysis
        2. Time-Based Analysis
        3. Position Size Analysis
        4. Pattern Recognition
        5. Risk Management Assessment
    
        Most importantly, provide:
        - Trading mistakes and their severity
        - Specific improvements by category
        - Identified patterns in winning and losing trades
    
        IMPORTANT: Return ONLY a valid JSON object with the following structure, without any markdown formatting or additional text:
        {
            "mistakes": [
                { "title": string, "description": string, "severity": "high|medium|low" }
            ],
            "improvements": [
                { "category": string, "recommendations": string[] }
            ],
            "patterns": {
                "winning": string[],
                "losing": string[],
                "general": string[]
            }
        }`;
    }

    private validateAndCleanAnalysis(analysis: AnalysisResponse): AnalysisResponse {
        // Ensure all required properties exist
        const cleanAnalysis: AnalysisResponse = {
            mistakes: analysis.mistakes || [],
            improvements: analysis.improvements || [],
            patterns: {
                winning: analysis.patterns?.winning || [],
                losing: analysis.patterns?.losing || [],
                general: analysis.patterns?.general || []
            }
        };

        // Validate mistakes
        cleanAnalysis.mistakes = cleanAnalysis.mistakes.map(mistake => ({
            title: mistake.title || 'Unknown Issue',
            description: mistake.description || 'No description provided',
            severity: ['high', 'medium', 'low'].includes(mistake.severity) ? mistake.severity : 'medium'
        }));

        // Validate improvements
        cleanAnalysis.improvements = cleanAnalysis.improvements.map(improvement => ({
            category: improvement.category || 'General',
            recommendations: Array.isArray(improvement.recommendations) ?
                improvement.recommendations : [improvement.recommendations || 'No recommendations provided']
        }));

        return cleanAnalysis;
    }
}