"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import type { Equipment } from "@/lib/equipment";
import { StatusBadge } from "@/components/status-badge";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { buttonVariants } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function MyEquipmentPage() {
  const [items, setItems] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<Equipment | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let active = true;
    apiFetch<{ data: Equipment[] }>("/api/equipment/mine")
      .then((res) => active && setItems(res.data))
      .catch((err: Error) => active && setError(err.message))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  async function confirmDelete() {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await apiFetch(`/api/equipment/${toDelete._id}`, { method: "DELETE" });
      setItems((prev) => prev.filter((i) => i._id !== toDelete._id));
      toast.success("Equipment deleted.");
      setToDelete(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not delete equipment");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">My Equipment</h1>
        <Link href="/dashboard/owner/add-equipment" className={buttonVariants()}>
          Add equipment
        </Link>
      </div>

      {loading && <p className="py-10 text-center text-muted-foreground">Loading your equipment...</p>}

      {error && !loading && (
        <p className="rounded-md border border-destructive/40 bg-destructive/10 p-4 text-sm">
          Could not load your equipment: {error}
        </p>
      )}

      {!loading && !error && items.length === 0 && (
        <div className="rounded-md border border-dashed p-10 text-center">
          <p className="font-medium">You haven&apos;t added any equipment yet.</p>
          <Link
            href="/dashboard/owner/add-equipment"
            className={`${buttonVariants()} mt-4`}
          >
            Add your first item
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
                <TableHead>Rental price</TableHead>
                <TableHead>Available</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item._id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell>
                    ৳{item.rentalPrice} / {item.rentalType}
                  </TableCell>
                  <TableCell>{item.availableQuantity}</TableCell>
                  <TableCell>
                    <StatusBadge status={item.status} />
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/equipment/${item._id}`}
                        className={buttonVariants({ variant: "outline", size: "sm" })}
                      >
                        View
                      </Link>
                      <Link
                        href={`/dashboard/owner/my-equipment/${item._id}/edit`}
                        className={buttonVariants({ variant: "outline", size: "sm" })}
                      >
                        Update
                      </Link>
                      <button
                        onClick={() => setToDelete(item)}
                        className={buttonVariants({ variant: "destructive", size: "sm" })}
                      >
                        Delete
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <ConfirmDialog
        open={!!toDelete}
        title="Delete equipment?"
        message={`"${toDelete?.name}" will be permanently removed. This cannot be undone.`}
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}