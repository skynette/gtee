'use client'

import { useMutation, useQuery, useQueryClient } from "react-query";
import { enqueueTradingDataTask, getTradingDataTask } from "./api";
import { useEffect, useState } from "react";
import { AnalyzeTradesResponse, TaskStatusResponse } from "@/lib/types/responses";

export const useTradingData = () => {
    const queryClient = useQueryClient();
    const [executionId, setExecutionId] = useState<string | null>(null);

    // Retrieve executionId from localStorage on component mount
    useEffect(() => {
        const storedExecutionId = localStorage.getItem("executionId");
        if (storedExecutionId) {
            setExecutionId(storedExecutionId);
        }
    }, []);

    // Mutation to start the task
    const enqueueTask = useMutation<AnalyzeTradesResponse, Error, string>(enqueueTradingDataTask, {
        onSuccess: (data) => {
            const newExecutionId = data.data.execution_id;
            setExecutionId(newExecutionId);

            // Store executionId in localStorage
            localStorage.setItem("executionId", newExecutionId);
        },
        onError: () => {
            console.log("error fetching data")
        },
    });

    // Polling query for task status
    const taskQuery = useQuery<TaskStatusResponse, Error>(
        ["taskStatus", executionId],
        () => getTradingDataTask(executionId as string),
        {
            enabled: !!executionId,
            refetchInterval: (data: TaskStatusResponse | undefined) =>
                data && data.data && !data.data.is_execution_finished ? 20000 : false,
            refetchOnMount: false,
            onSuccess: (data: TaskStatusResponse) => {
                if (data.data.is_execution_finished) {
                    queryClient.invalidateQueries(["taskStatus"]);

                    // Clear executionId from localStorage once the task is complete
                    localStorage.removeItem("executionId");
                }
            },
        }
    );

    return {
        enqueueTask,
        taskQuery,
    };
};