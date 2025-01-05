import { Request, Response } from 'express';
import { DuneAPIClient } from './dune-client';
import { config } from '../config/env';
import { transformDuneData } from './transformer';
import { TradingAnalyzer } from './ai-analyzer';
import Redis from "ioredis";

const duneClient = new DuneAPIClient(config.duneApiKey);
const redis = new Redis(process.env.REDIS_URL!);

export const enqueueTradingDataTask = async (req: Request, res: Response) => {
    try {
        const { walletAddress } = req.body;

        if (!walletAddress) {
            res.status(400).json({ error: 'Wallet address is required' });
            return
        }

        const tradingData = await duneClient.executeQuery(config.queryId, walletAddress);

        res.json({ success: true, data: tradingData });
    } catch (error) {
        res.status(500).json({ success: false, error: "an error occurred" });
    }
};

export const getTradingDataTask = async (req: Request, res: Response) => {
    try {
        const { execution_id } = req.params;

        if (!execution_id) {
            res.status(400).json({ error: "Task ID is required" });
            return;
        }

        // Check if cached data exists
        const cacheKey = `trading-data:${execution_id}`;
        const cachedData = await redis.get(cacheKey);

        if (cachedData) {
            res.json({ success: true, ...JSON.parse(cachedData) });
            return;
        }

        // Fetch trading data
        const tradingData = await duneClient.getExecutionResults(execution_id);

        if (tradingData.state === "QUERY_STATE_COMPLETED") {
            const transformedData = transformDuneData(tradingData);
            const analyzer = new TradingAnalyzer(process.env.OPENAI_API_KEY!);
            const analysis = await analyzer.analyzeTrading(transformedData);

            // Cache the response for 24 hours
            const response = { data: tradingData, transformedData, analysis };
            await redis.set(cacheKey, JSON.stringify(response), "EX", 24 * 60 * 60); // Cache for 24 hours

            res.json({ success: true, ...response });
            return;
        }

        res.json({ success: true, data: tradingData });
    } catch (error) {
        console.error("Error in getTradingDataTask:", error);
        res.status(500).json({ success: false, error: "An error occurred" });
    }
};