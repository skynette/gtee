import { Request, Response } from 'express';
import { DuneAPIClient } from './dune-client';
import { config } from '../config/env';

const duneClient = new DuneAPIClient(config.duneApiKey);

export const enqueueTradingDataTask = async (req: Request, res: Response) => {
    try {
        const { walletAddress } = req.body;

        if (!walletAddress) {
            res.status(400).json({ error: 'Wallet address is required' });
            return
        }

        const tradingData = await duneClient.executeQuery(config.queryId, walletAddress);

        res.json({ success: true, data:tradingData });
    } catch (error) {
        res.status(500).json({ success: false, error: "an error occurred" });
    }
};

export const getTradingDataTask = async (req: Request, res: Response) => {
    try {
        const { execution_id } = req.params;

        if (!execution_id) {
            res.status(400).json({ error: 'Task ID is required' });
            return
        }

        const tradingData = await duneClient.getExecutionResults(execution_id);

        res.json({ success: true, data: tradingData });
    } catch (error) {
        res.status(500).json({ success: false, error: "an error occurred" });
    }
};
