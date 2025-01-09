import Link from 'next/link';

import { cn } from '@/lib/utils';

import { DynamicImage } from './dynamic-image';
import { Pill } from 'lucide-react';

export default function Logo({
    width = 100,
    height = width,
    className,
}: {
    width?: number;
    height?: number;
    className?: string;
}) {
    return (
        <DynamicImage
            lightSrc="/images/logo.svg"
            darkSrc="/images/logo.svg"
            alt="Logo"
            width={width}
            height={height}
            className={cn('select-none', className)}
        />
    );
}

interface BrandProps {
    className?: string;
}

export function Brand({ className }: BrandProps) {
    return (
        <Link href="https://pump.fun" className={className}>
            <div className="flex items-center gap-2">
                <Logo width={32} />
                {/* <Link
                    href=""
                    target="_blank"
                    className="transition-colors hover:text-primary">
                </Link> */}
                <Pill className="h-5 w-5" />
            </div>
        </Link>
    );
}
