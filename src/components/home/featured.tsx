"use client";

import Link from "next/link";
import { usePublicData } from "@/lib/use-public-data";
import type { Equipment } from "@/lib/equipment";
import { Section } from "@/components/section";
import { FadeIn } from "@/components/motion";
import { EquipmentCard } from "@/components/equipment-card";
import { buttonVariants } from "@/components/ui/button";

export function FeaturedEquipment() {
  const { data, loading, error } = usePublicData<Equipment[]>("/api/equipment/featured");

  return (
    <Section
      title="Featured equipment"
      subtitle="Recently approved listings from verified owners."
      className="border-y bg-muted/30 max-w-none"
    >
      <div className="mx-auto max-w-7xl">
        {loading && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-80 animate-pulse rounded-xl bg-muted" />
            ))}
          </div>
        )}

        {error && !loading && (
          <p className="rounded-md border border-destructive/40 bg-destructive/10 p-4 text-sm">
            Could not load equipment: {error}
          </p>
        )}

        {!loading && !error && data?.length === 0 && (
          <div className="rounded-xl border border-dashed p-10 text-center">
            <p className="font-medium">No equipment has been listed yet.</p>
            <Link href="/register" className={`${buttonVariants()} mt-4`}>
              Be the first to list
            </Link>
          </div>
        )}

        {!loading && !error && data && data.length > 0 && (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {data.map((item, i) => (
                <FadeIn key={item._id} delay={i * 0.06} className="h-full">
                  <EquipmentCard item={item} />
                </FadeIn>
              ))}
            </div>
            <div className="mt-10 text-center">
              <Link href="/equipment" className={buttonVariants({ variant: "outline", size: "lg" })}>
                View all equipment
              </Link>
            </div>
          </>
        )}
      </div>
    </Section>
  );
}