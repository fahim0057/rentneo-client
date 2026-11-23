"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import type { Equipment } from "@/lib/equipment";
import { formatBDT } from "@/lib/format";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
        <div className="overflow-x-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Equipment</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Availability</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item._id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-10 w-14 rounded object-cover"
                      />
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.brand} {item.model}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell className="whitespace-nowrap">
                    {formatBDT(item.rentalPrice)}{" "}
                    <span className="text-xs text-muted-foreground">/ {item.rentalType}</span>
                  </TableCell>
                  <TableCell>{item.location}</TableCell>
                  <TableCell>
                    {item.availableQuantity > 0
                      ? `${item.availableQuantity} available`
                      : "Unavailable"}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap justify-end gap-2">
                      <Link
                        href={`/equipment/${item._id}`}
                        className={buttonVariants({ variant: "outline", size: "sm" })}
                      >
                        View details
                      </Link>
                      <Button
                        variant="destructive"
                        size="sm"
                        disabled={removingId === item._id}
                        onClick={() => remove(item)}
                      >
                        {removingId === item._id ? "Removing..." : "Remove"}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
