import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";


function PerformanceChart({ data }: { data: any[] }) {
    if (!data?.length) {
        return (
            <div className="flex h-full items-center justify-center">
                <p className="text-sm text-muted-foreground">
                    No data available
                </p>
            </div>
        );
    }

    // Process data to show cumulative performance
    const processedData = data.map((point, index) => ({
        ...point,
        date: new Date(point.date).toLocaleDateString(),
        cumulativeProfitLoss: data
            .slice(0, index + 1)
            .reduce((sum, p) => sum + p.profitLoss, 0),
    }));

    return (
        <ResponsiveContainer width="100%" height="100%">
            <LineChart data={processedData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-50" />
                <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => value.split(',')[0]}
                />
                <YAxis
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => `${value.toFixed(2)}%`}
                />
                <Tooltip
                    formatter={(value: number) => `${value.toFixed(2)}%`}
                    labelFormatter={(label) =>
                        new Date(label).toLocaleDateString()
                    }
                />
                <Line
                    type="monotone"
                    dataKey="cumulativeProfitLoss"
                    stroke="#8884d8"
                    strokeWidth={2}
                    dot={false}
                />
            </LineChart>
        </ResponsiveContainer>
    );
}


export default PerformanceChart