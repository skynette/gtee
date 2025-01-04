import { Skeleton } from "@/components/ui/skeleton";

// Loading State Component
function LoadingState() {
    return (
        <div className="p-6">
            <Skeleton className="mb-8 h-8 w-64" />
            <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-32" />
                ))}
            </div>
            <div className="grid gap-6 lg:grid-cols-2">
                <Skeleton className="h-[400px]" />
                <Skeleton className="h-[400px]" />
            </div>
        </div>
    );
}

export default LoadingState