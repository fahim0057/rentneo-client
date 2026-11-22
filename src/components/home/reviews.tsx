"use client";

import { Star } from "lucide-react";
import { usePublicData } from "@/lib/use-public-data";
import { Section } from "@/components/section";
import { FadeIn } from "@/components/motion";

interface Review {
  _id: string;
  name: string;
  rating: number;
  comment: string;
}

export function Reviews() {
  const { data, loading, error } = usePublicData<Review[]>("/api/reviews");

  return (
    <Section title="What our customers say" subtitle="Real feedback from renters and owners.">
      {loading && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-40 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      )}
      {error && !loading && (
        <p className="rounded-md border border-destructive/40 bg-destructive/10 p-4 text-sm">
          Could not load reviews: {error}
        </p>
      )}
      {!loading && !error && data?.length === 0 && (
        <p className="rounded-xl border border-dashed p-10 text-center">No reviews yet.</p>
      )}
      {!loading && !error && data && data.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {data.slice(0, 6).map((r, i) => (
            <FadeIn key={r._id} delay={i * 0.06} className="h-full">
              <figure className="flex h-full flex-col rounded-xl border bg-card p-6">
                <div className="flex gap-0.5" aria-label={`${r.rating} out of 5 stars`}>
                  {Array.from({ length: 5 }).map((_, s) => (
                    <Star
                      key={s}
                      className={`h-4 w-4 ${s < r.rating ? "fill-primary text-primary" : "text-muted-foreground/40"}`}
                    />
                  ))}
                </div>
                <blockquote className="mt-4 flex-1 text-sm text-muted-foreground">
                  &ldquo;{r.comment}&rdquo;
                </blockquote>
                <figcaption className="mt-4 font-semibold">{r.name}</figcaption>
              </figure>
            </FadeIn>
          ))}
        </div>
      )}
    </Section>
  );
}