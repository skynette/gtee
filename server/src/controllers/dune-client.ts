import axios, { AxiosInstance } from 'axios';

// Types for API responses
interface ExecutionResponse {
    execution_id: string;
    state: string;
}

interface ExecutionStatus {
    execution_id: string;
    query_id: number;
    is_execution_finished: boolean;
    state: string;
    submitted_at: string;
    expires_at: string;
    execution_started_at: string;
    execution_ended_at: string;
    result_metadata: {
        column_names: string[];
        column_types: string[];
        row_count: number;
        result_set_bytes: number;
        total_row_count: number;
        total_result_set_bytes: number;
        datapoint_count: number;
        pending_time_millis: number;
        execution_time_millis: number;
    };
}

interface TokenData {
    token_address: string;
    buy: number | null;
    sell: number | null;
    pnl: number | null;
    usd_balance: number | null;
    total_pnl: number | null;
    token_balance: number | null;
    initial_buy_price: number | null;
    latest_price: number | null;
    latest_block_time: string | null;
}

interface ExecutionResults {
    execution_id: string;
    query_id: number;
    state: string;
    result: {
        rows: TokenData[];
        metadata: ExecutionStatus['result_metadata'];
    };
}

export class DuneAPIClient {
    private readonly client: AxiosInstance;
    private readonly POLL_INTERVAL = 10000; // 10 seconds
    private readonly MAX_RETRIES = 30; // 5 minutes with 10s interval

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
    private async executeQuery(queryId: string, walletAddress: string): Promise<ExecutionResponse> {
        try {
            const response = await this.client.post<ExecutionResponse>(`/query/${queryId}/execute`, {
                query_parameters: {
                    wallet_address: walletAddress,
                },
                performance: 'medium',
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
    private async checkExecutionStatus(executionId: string): Promise<ExecutionStatus> {
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
    private async getExecutionResults(executionId: string): Promise<ExecutionResults> {
        try {
            const response = await this.client.get<ExecutionResults>(`/execution/${executionId}/results`);
            console.log("execution results", response.data)
            return response.data;
        } catch (error) {
            throw new Error(`Failed to get execution results: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Polls the execution status until completion or timeout
     */
    private async pollExecutionStatus(executionId: string): Promise<ExecutionStatus> {
        let retries = 0;

        while (retries < this.MAX_RETRIES) {
            const status = await this.checkExecutionStatus(executionId);
            console.log("poll exec status", status)

            if (status.state === 'QUERY_STATE_COMPLETED') {
                return status;
            }

            if (status.state === 'QUERY_STATE_FAILED') {
                throw new Error('Query execution failed');
            }

            await new Promise(resolve => setTimeout(resolve, this.POLL_INTERVAL));
            retries++;
        }

        throw new Error('Query execution timed out');
    }

    /**
     * Main function to get wallet trading data
     */
    public async getWalletTradingData(queryId: string, walletAddress: string): Promise<ExecutionResults> {
        try {
            // Step 1: Execute query
            const execution = await this.executeQuery(queryId, walletAddress);

            // Step 2: Poll for completion
            await this.pollExecutionStatus(execution.execution_id);

            // Step 3: Get results
            const results = await this.getExecutionResults(execution.execution_id);
            console.log({ results })

            return results;
        } catch (error) {
            throw new Error(`Failed to get wallet trading data: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
}