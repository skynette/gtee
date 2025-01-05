import axios, { AxiosInstance } from 'axios';
import { ExecutionResponse, ExecutionResults, ExecutionStatus } from '../types/types';

export class DuneAPIClient {
    private readonly client: AxiosInstance;

    constructor(apiKey: string) {
        this.client = axios.create({
            baseURL: 'https://api.dune.com/api/v1',
            headers: {
                'X-Dune-API-Key': apiKey,
                'Content-Type': 'application/json',
            },
        });
    }

    /**
     * Initiates a query execution for a wallet address
     */
    public async executeQuery(queryId: string, walletAddress: string): Promise<ExecutionResponse> {
        try {
            const response = await this.client.post<ExecutionResponse>(`/query/${queryId}/execute`, {
                query_parameters: {
                    wallet_address: walletAddress,
                },
                performance: 'large',
            });
            console.log("execute: query", response.data)
            return response.data;
        } catch (error) {
            throw new Error(`Failed to execute query: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Checks the execution status
     */
    public async checkExecutionStatus(executionId: string): Promise<ExecutionStatus> {
        try {
            const response = await this.client.get<ExecutionStatus>(`/execution/${executionId}/status`);
            console.log("execution status", response.data)
            return response.data;
        } catch (error) {
            throw new Error(`Failed to check execution status: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Fetches the execution results
     */
    public async getExecutionResults(executionId: string): Promise<ExecutionResults> {
        try {
            const response = await this.client.get<ExecutionResults>(`/execution/${executionId}/results`);
            console.log("execution results", response.data)
            return response.data;
        } catch (error) {
            throw new Error(`Failed to get execution results: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Main function to get wallet trading data
     */
    public async getWalletTradingData(queryId: string, walletAddress: string): Promise<ExecutionResults> {
        try {
            // Step 1: Execute query
            const execution = await this.executeQuery(queryId, walletAddress);

            // Step 2: Get results
            const results = await this.getExecutionResults(execution.execution_id);
            console.log({ results })

            return results;
        } catch (error) {
            throw new Error(`Failed to get wallet trading data: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
}