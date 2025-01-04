import { AnalyzeTradesResponse, TaskStatusResponse } from "@/lib/types/responses";
import axios from "axios";

const apiClient = axios.create({
    baseURL: "http://localhost:7000/api", // Adjust baseURL as needed
});

// Enqueue trading data task with walletAddress
export const enqueueTradingDataTask = async (walletAddress: string): Promise<AnalyzeTradesResponse> => {
    const response = await apiClient.post<AnalyzeTradesResponse>("/analyze-trades", {
        walletAddress,
    });
    return response.data;
};


// Fetch task status
export const getTradingDataTask = async (executionId: string): Promise<TaskStatusResponse> => {
    const response = await apiClient.get<TaskStatusResponse>(`/task/${executionId}`);
    return response.data;
};
