
'use client';

import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface MiniLoaderProps {
    className?: string;
}

export default function MiniLoader({ className }: MiniLoaderProps) {
  return (
    <div className={cn("flex justify-center items-center", className)}>
        <Loader2 className="h-6 w-6 text-primary animate-spin" />
    </div>
  );
}
