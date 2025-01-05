'use client'

import { useMutation } from "react-query";
import { enqueueTradingDataTask } from "./api";
import { AnalyzeTradesResponse } from "@/lib/types/responses";

export const useTradingData = () => {
    // Mutation to start the task
    const enqueueTask = useMutation<AnalyzeTradesResponse, Error, string>(enqueueTradingDataTask, {
        onSuccess: (data) => {
            const newExecutionId = data.data.execution_id;

            // Store executionId in localStorage
            console.log("setting exec ID", newExecutionId)
            localStorage.setItem("executionId", newExecutionId);
        },
        onError: () => {
            console.log("error fetching data")
        },
    });

    return {
        enqueueTask,
    };
};