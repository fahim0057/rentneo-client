"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import type { Equipment } from "@/lib/equipment";
import { EquipmentCard } from "@/components/equipment-card";
import { Button, buttonVariants } from "@/components/ui/button";

export default function FavoritesPage() {
  const [items, setItems] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    apiFetch<{ data: Equipment[] }>("/api/favorites")
      .then((res) => {
        if (active) setItems(res.data);
      })
      .catch((err: Error) => {
        if (active) setError(err.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  async function remove(item: Equipment) {
    setRemovingId(item._id);
    try {
      await apiFetch(`/api/favorites/${item._id}`, { method: "DELETE" });
      setItems((prev) => prev.filter((i) => i._id !== item._id));
      toast.success(`Removed "${item.name}" from favorites.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not remove favorite");
    } finally {
      setRemovingId(null);
    }
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Favorites</h1>

      {loading && <p className="py-10 text-center text-muted-foreground">Loading favorites...</p>}

      {error && !loading && (
        <p className="rounded-md border border-destructive/40 bg-destructive/10 p-4 text-sm">
          Could not load favorites: {error}
        </p>
      )}

      {!loading && !error && items.length === 0 && (
        <div className="rounded-md border border-dashed p-10 text-center">
          <p className="font-medium">You haven&apos;t saved any equipment yet.</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Tap “Add to favorites” on any listing to keep it here.
          </p>
          <Link href="/equipment" className={`${buttonVariants()} mt-4`}>
            Browse equipment
          </Link>
        </div>
      )}

      {!loading && !error && items.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <div key={item._id} className="flex flex-col gap-2">
              <EquipmentCard item={item} />
              <Button
                variant="outline"
                size="sm"
                disabled={removingId === item._id}
                onClick={() => remove(item)}
              >
                {removingId === item._id ? "Removing..." : "Remove"}
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
