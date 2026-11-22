"use client";

import Link from "next/link";
import { Camera, Cpu, HardHat, PartyPopper, Tractor, Truck } from "lucide-react";
import { usePublicData } from "@/lib/use-public-data";
import { Section } from "@/components/section";
import { FadeIn } from "@/components/motion";

const CATEGORIES = [
  { name: "Construction Equipment", icon: HardHat },
  { name: "Photography Equipment", icon: Camera },
  { name: "Vehicles & Transportation", icon: Truck },
  { name: "Agriculture Equipment", icon: Tractor },
  { name: "Electronics", icon: Cpu },
  { name: "Event Equipment", icon: PartyPopper },
];

export function Categories() {
  const { data } = usePublicData<{ _id: string; count: number }[]>("/api/equipment/categories");
  const counts = new Map((data ?? []).map((c) => [c._id, c.count]));

  return (
    <Section title="Browse by category" subtitle="Find the right equipment for your project.">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CATEGORIES.map(({ name, icon: Icon }, i) => (
          <FadeIn key={name} delay={i * 0.05} className="h-full">
            <Link
              href={`/equipment?category=${encodeURIComponent(name)}`}
              className="group flex h-full items-center gap-4 rounded-xl border bg-card p-5 transition hover:border-primary/60 hover:bg-accent"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
                <Icon className="h-6 w-6" />
              </span>
              <span>
                <span className="block font-semibold">{name}</span>
                <span className="text-sm text-muted-foreground">
                  {counts.get(name) ?? 0} listed
                </span>
              </span>
            </Link>
          </FadeIn>
        ))}
      </div>
    </Section>
  );
}