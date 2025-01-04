import { AlertCircleIcon } from "lucide-react";


function WarningItem({ warning }: { warning: string }) {
    return (
        <div className="flex items-center gap-3 rounded-lg border border-destructive/20 bg-destructive/10 p-4">
            <AlertCircleIcon className="h-4 w-4 text-destructive" />
            <div>
                <p className="text-sm font-medium text-destructive">
                    {warning}
                </p>
            </div>
        </div>
    );
}

export default WarningItem