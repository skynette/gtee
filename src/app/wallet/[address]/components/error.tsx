import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertCircleIcon } from "lucide-react";

// Error State Component
function ErrorState({ error, onRetry }: { error: Error; onRetry: () => void }) {
    return (
        <div className="flex min-h-screen items-center justify-center p-6">
            <Card className="max-w-md p-6 text-center">
                <AlertCircleIcon className="mx-auto mb-4 h-12 w-12 text-destructive" />
                <h2 className="mb-2 text-lg font-semibold">
                    Error Loading Data
                </h2>
                <p className="mb-4 text-sm text-muted-foreground">
                    {error.message}
                </p>
                <Button onClick={onRetry}>Try Again</Button>
            </Card>
        </div>
    );
}

export default ErrorState