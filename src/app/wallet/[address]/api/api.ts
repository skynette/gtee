import { AnalyzeTradesResponse, TaskStatusResponse } from "@/lib/types/responses";
import axios from "axios";

const SERVER_BASE_URL = process.env.NEXT_PUBLIC_SERVER_BASE_URL

const apiClient = axios.create({
    baseURL: SERVER_BASE_URL,
});

// Enqueue trading data task with walletAddress
export const enqueueTradingDataTask = async (walletAddress: string): Promise<AnalyzeTradesResponse> => {
    console.log("sever url", SERVER_BASE_URL)
    const response = await apiClient.post<AnalyzeTradesResponse>(`${SERVER_BASE_URL}/analyze-trades`, {
        walletAddress,
    });
    return response.data;
};


// Fetch task status
export const getTradingDataTask = async (executionId: string): Promise<TaskStatusResponse> => {
    console.log("server url", SERVER_BASE_URL)
    const response = await apiClient.get<TaskStatusResponse>(`${SERVER_BASE_URL}/task/${executionId}`);
    return response.data;
};
