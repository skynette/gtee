function DexRow({
    rank,
    dex,
    efficiency,
    volume,
}: {
    rank: number;
    dex: string;
    efficiency: number;
    volume: number;
}) {
    return (
        <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-muted-foreground">
                    #{rank}
                </span>
                <div>
                    <p className="font-medium">{dex}</p>
                    <p className="text-sm text-muted-foreground">
                        ${(volume * efficiency).toLocaleString()}
                    </p>
                </div>
            </div>
            <div className="text-sm">
                <div className="h-2 w-24 rounded-full bg-secondary">
                    <div
                        className="h-2 rounded-full bg-primary"
                        style={{ width: `${efficiency * 100}%` }}
                    />
                </div>
                <span className="mt-1 block text-right text-xs text-muted-foreground">
                    {(efficiency * 100).toFixed(1)}% Efficient
                </span>
            </div>
        </div>
    );
}

export default DexRow