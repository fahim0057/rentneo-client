"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  value: number;
  size?: "sm" | "lg";
  onChange?: (value: number) => void;
}

export function StarRating({ value, size = "sm", onChange }: Props) {
  const [hovered, setHovered] = useState(0);
  const shown = hovered || value;
  const iconClass = size === "lg" ? "h-6 w-6" : "h-4 w-4";

  return (
    <div className="inline-flex items-center gap-0.5" aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((star) => {
        const icon = (
          <Star
            className={cn(iconClass, star <= Math.round(shown) ? "fill-amber-400 text-amber-400" : "text-muted-foreground/40")}
          />
        );

        if (!onChange) return <span key={star}>{icon}</span>;

        return (
          <button
            key={star}
            type="button"
            aria-label={`${star} star${star === 1 ? "" : "s"}`}
            className="p-0.5"
            onClick={() => onChange(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
          >
            {icon}
          </button>
        );
      })}
    </div>
  );
}
