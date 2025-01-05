import { AlertCircleIcon } from "lucide-react";

interface WarningItemProps {
    warning: string;
    severity?: "high" | "medium" | "low";
}

function WarningItem({ warning, severity = "medium" }: WarningItemProps) {
    const severityColors = {
        high: "border-red-500/20 bg-red-500/10 text-red-700",
        medium: "border-yellow-500/20 bg-yellow-500/10 text-yellow-700",
        low: "border-blue-500/20 bg-blue-500/10 text-blue-700"
    };

    return (
        <div className={`flex items-center gap-3 rounded-lg border p-4 ${severityColors[severity]}`}>
            <AlertCircleIcon className="h-4 w-4" />
            <div className="flex-1">
                <p className="text-sm font-medium">
                    {warning}
                </p>
            </div>
        </div>
    );
}


export default WarningItem