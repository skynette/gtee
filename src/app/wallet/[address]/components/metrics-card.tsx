import { Card } from "@/components/ui/card";
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";

function MetricCard({
    title,
    value,
    icon: Icon,
    trend,
    subtitle,
}: {
    title: string;
    value: string;
    icon: any;
    trend: {
        value: number;
        positive?: boolean;
        neutral?: boolean;
    };
    subtitle: string;
}) {
    return (
        <Card className="p-6">
            <div className="flex items-center justify-between">
                <Icon className="h-5 w-5 text-muted-foreground" />
                {trend && !trend.neutral && (
                    <div
                        className={`flex items-center text-sm ${trend.positive ? 'text-green-500' : 'text-red-500'
                            }`}>
                        {trend.positive ? (
                            <ArrowUpIcon className="h-4 w-4" />
                        ) : (
                            <ArrowDownIcon className="h-4 w-4" />
                        )}
                        <span>{Math.abs(trend.value).toFixed(1)}%</span>
                    </div>
                )}
            </div>
            <h3 className="mt-4 text-sm font-medium text-muted-foreground">
                {title}
            </h3>
            <p className="mt-2 text-2xl font-bold">{value}</p>
            <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        </Card>
    );
}


export default MetricCard