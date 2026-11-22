import type { Metadata } from "next";
import { Suspense } from "react";
import { EquipmentBrowser } from "@/components/equipment-browser";

export const metadata: Metadata = {
  title: "All Equipment",
  description: "Search, filter and sort approved rental equipment from verified owners.",
};

export default function EquipmentPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-3xl font-bold tracking-tight">All Equipment</h1>
      <p className="mt-2 text-muted-foreground">
        Find the right equipment, filter by what matters to you, and book it online.
      </p>
      <div className="mt-8">
        <Suspense fallback={<p className="py-10 text-center text-muted-foreground">Loading...</p>}>
          <EquipmentBrowser />
        </Suspense>
      </div>
    </main>
  );
}