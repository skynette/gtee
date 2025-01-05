// components/loading-state.tsx
import { Card } from "@/components/ui/card";
import { Loader2Icon } from "lucide-react";

function LoadingState() {
    return (
        <div className="w-full">
            <Card className="mx-auto max-w-2xl p-8">
                <div className="flex flex-col items-center justify-center space-y-4">
                    <div className="relative">
                        <div className="absolute -inset-1">
                            <div className="h-full w-full animate-pulse rounded-full bg-gradient-to-r from-primary/20 to-secondary/20 blur" />
                        </div>
                        <Loader2Icon className="relative z-10 h-12 w-12 animate-spin text-primary" />
                    </div>
                    <h2 className="text-xl font-semibold">Analyzing Trading Data</h2>
                    <div className="w-full max-w-xs space-y-2">
                        <div className="h-2 w-full animate-pulse rounded-full bg-muted">
                            <div className="h-2 animate-progress rounded-full bg-primary"
                                style={{ width: '0%' }} />
                        </div>
                        <p className="text-center text-sm text-muted-foreground">
                            This may take up to 5 minutes
                        </p>
                    </div>
                    <div className="space-y-2 text-center">
                        <p className="text-sm text-muted-foreground">
                            We are processing:
                        </p>
                        <div className="space-y-1">
                            {['Transaction History', 'Token Performance', 'Risk Analysis', 'Market Data'].map((item, index) => (
                                <p key={index} className="text-sm">
                                    {item}
                                </p>
                            ))}
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
}

export default LoadingState;